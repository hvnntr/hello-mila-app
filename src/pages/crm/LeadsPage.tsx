import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getLeads } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Lead } from '@/types';

type LeadStatus = 'all' | 'new' | 'qualified' | 'booked' | 'completed' | 'lost';

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  qualified: 'bg-violet-50 text-violet-700',
  booked: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-gray-100 text-gray-700',
  lost: 'bg-red-50 text-red-700',
};

export function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<LeadStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeads = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      const { data } = await getLeads(user.id);
      if (data) {
        setLeads(data as unknown as Lead[]);
        setFilteredLeads(data as unknown as Lead[]);
      }
      setIsLoading(false);
    };

    loadLeads();
  }, [user]);

  useEffect(() => {
    let filtered = leads;
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(l => l.status === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(query) ||
        l.email.toLowerCase().includes(query) ||
        l.phone?.toLowerCase().includes(query) ||
        l.service_interest?.toLowerCase().includes(query)
      );
    }
    
    setFilteredLeads(filtered);
  }, [leads, activeFilter, searchQuery]);

  const formatTime = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const filterOptions: { value: LeadStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: leads.length },
    { value: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
    { value: 'qualified', label: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
    { value: 'booked', label: 'Booked', count: leads.filter(l => l.status === 'booked').length },
    { value: 'completed', label: 'Completed', count: leads.filter(l => l.status === 'completed').length },
    { value: 'lost', label: 'Lost', count: leads.filter(l => l.status === 'lost').length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {filterOptions.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.value
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.label}
              <span className="ml-1.5 opacity-60">{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No leads yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery || activeFilter !== 'all'
                ? 'No leads match your filters. Try adjusting your search.'
                : 'Leads will appear here when Mila qualifies enquiries.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredLeads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="w-full p-4 rounded-lg bg-card border border-border hover:border-foreground/20 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">
                      {lead.name?.charAt(0) || lead.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {lead.name || 'Unknown'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[lead.status] || 'bg-secondary text-muted-foreground'}`}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                    
                    {lead.service_interest && (
                      <p className="text-sm mt-2">
                        Interested in: <span className="text-muted-foreground">{lead.service_interest}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Last contact</p>
                    <p>{formatTime(lead.last_contact_at)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        Send email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Create booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
