import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Edit2,
  MessageSquare,
  Clock,
  Tag,
  MoreVertical,
  Save,
  X
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getLeads, updateLead } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Lead } from '@/types';

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'booked', label: 'Booked' },
  { value: 'completed', label: 'Completed' },
  { value: 'lost', label: 'Lost' },
];

export function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});

  useEffect(() => {
    const loadLead = async () => {
      if (!leadId || !user?.id) return;
      
      setIsLoading(true);
      const { data } = await getLeads(user.id);
      if (data) {
        const foundLead = (data as unknown as Lead[]).find(l => l.id === leadId);
        if (foundLead) {
          setLead(foundLead);
          setEditedLead(foundLead);
        }
      }
      setIsLoading(false);
    };

    loadLead();
  }, [leadId, user]);

  const handleSave = async () => {
    if (!lead?.id) return;
    
    const { data, error } = await updateLead(lead.id, editedLead);
    if (!error && data) {
      setLead(data as unknown as Lead);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedLead(lead || {});
    setIsEditing(false);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading lead...</span>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">Lead not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This lead may have been deleted or you don't have access.
        </p>
        <Button onClick={() => navigate('/leads')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {lead.name || 'Unknown'}
              </h1>
              {!isEditing && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                  lead.status === 'qualified' ? 'bg-violet-50 text-violet-700' :
                  lead.status === 'booked' ? 'bg-emerald-50 text-emerald-700' :
                  lead.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {lead.status}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Lead since {new Date(lead.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Send email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    Create booking
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${lead.email}`}
                      className="text-sm hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedLead.phone || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                      className="mila-input mt-1"
                      placeholder="Add phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {lead.phone ? (
                        <a 
                          href={`tel:${lead.phone}`}
                          className="text-sm hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not provided</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Service Interest</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLead.service_interest || ''}
                    onChange={(e) => setEditedLead({ ...editedLead, service_interest: e.target.value })}
                    className="mila-input mt-1"
                    placeholder="What service are they interested in?"
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {lead.service_interest || 'Not specified'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Source</label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  {lead.source || 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  value={editedLead.notes || ''}
                  onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                  className="w-full min-h-[120px] p-3 rounded-lg border border-input bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Add notes about this lead..."
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {lead.notes || 'No notes yet.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm">Lead created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                </div>
                {lead.last_contact_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm">Last contact</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(lead.last_contact_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  value={editedLead.status}
                  onValueChange={(value) => setEditedLead({ ...editedLead, status: value as Lead['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                  lead.status === 'qualified' ? 'bg-violet-50 text-violet-700' :
                  lead.status === 'booked' ? 'bg-emerald-50 text-emerald-700' :
                  lead.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Send email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Create booking
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                View conversation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
