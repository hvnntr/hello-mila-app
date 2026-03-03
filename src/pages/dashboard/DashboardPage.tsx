import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Calendar, 
  AlertCircle,
  Sparkles,
  Pause,
  Play,
  ChevronRight,
  Clock,
  Users,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getEmailThreads, getLeads, getBookings, getActivityLogs, updateUserProfile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EmailThread, Lead, Booking, ActivityLog } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAppStore();
  
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingMila, setIsTogglingMila] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      const [
        { data: threadsData },
        { data: leadsData },
        { data: bookingsData },
        { data: activitiesData }
      ] = await Promise.all([
        getEmailThreads(user.id, 5),
        getLeads(user.id),
        getBookings(user.id, 5),
        getActivityLogs(user.id, 10)
      ]);
      
      if (threadsData) setThreads(threadsData as unknown as EmailThread[]);
      if (leadsData) setLeads(leadsData as unknown as Lead[]);
      if (bookingsData) setBookings(bookingsData as unknown as Booking[]);
      if (activitiesData) setActivities(activitiesData as unknown as ActivityLog[]);
      
      setIsLoading(false);
    };

    loadDashboardData();
  }, [user]);

  const toggleMila = async () => {
    if (!user?.id || !profile) return;
    
    setIsTogglingMila(true);
    
    const newStatus = profile.mila_status === 'active' ? 'paused' : 'active';
    const { data, error } = await updateUserProfile(user.id, {
      mila_status: newStatus,
      mila_active: newStatus === 'active',
    });
    
    if (!error && data) {
      setProfile(data as unknown as typeof profile);
    }
    
    setIsTogglingMila(false);
  };

  const getStatusBadge = () => {
    switch (profile?.mila_status) {
      case 'active':
        return <span className="status-active"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active</span>;
      case 'paused':
        return <span className="status-paused"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Paused</span>;
      case 'error':
        return <span className="status-error"><AlertCircle className="w-3 h-3" />Error</span>;
      default:
        return <span className="status-paused">Setup</span>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email_received':
        return <Inbox className="w-4 h-4" />;
      case 'email_sent':
        return <MessageSquare className="w-4 h-4" />;
      case 'lead_created':
        return <Users className="w-4 h-4" />;
      case 'booking_created':
        return <Calendar className="w-4 h-4" />;
      case 'escalation':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const stats = {
    enquiriesToday: threads.filter(t => {
      const date = new Date(t.created_at);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length,
    pendingEnquiries: threads.filter(t => t.status === 'new' || t.status === 'processing').length,
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    upcomingBookings: bookings.filter(b => {
      const startTime = new Date(b.start_time);
      return startTime > new Date() && b.status !== 'canceled';
    }).length,
    escalations: threads.filter(t => t.status === 'escalated').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <Button
            variant={profile?.mila_status === 'active' ? 'secondary' : 'default'}
            size="sm"
            onClick={toggleMila}
            disabled={isTogglingMila}
          >
            {isTogglingMila ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : profile?.mila_status === 'active' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Mila
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate Mila
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Enquiries</p>
                <p className="text-2xl font-semibold mt-1">{stats.enquiriesToday}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            {stats.pendingEnquiries > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                {stats.pendingEnquiries} pending
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-semibold mt-1">{stats.newLeads}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.totalLeads} total leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                <p className="text-2xl font-semibold mt-1">{stats.upcomingBookings}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalations</p>
                <p className="text-2xl font-semibold mt-1">{stats.escalations}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            {stats.escalations > 0 ? (
              <p className="text-xs text-amber-600 mt-2">
                Needs attention
              </p>
            ) : (
              <p className="text-xs text-emerald-600 mt-2">
                All clear
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Recent Enquiries</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/inbox')}
              >
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {threads.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No enquiries yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mila will appear here once enquiries come in
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {threads.slice(0, 5).map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => navigate(`/inbox/${thread.id}`)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {thread.from_name?.charAt(0) || thread.from_email.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {thread.from_name || thread.from_email}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(thread.last_message_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {thread.subject}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      thread.status === 'new' ? 'bg-blue-50 text-blue-700' :
                      thread.status === 'responded' ? 'bg-emerald-50 text-emerald-700' :
                      thread.status === 'escalated' ? 'bg-amber-50 text-amber-700' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {thread.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/settings/integrations')}>
            Reconnect integrations
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings/business')}>
            Edit business hours
          </Button>
          <Button variant="outline" onClick={() => navigate('/knowledge')}>
            Update FAQs
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings/templates')}>
            Review templates
          </Button>
        </div>
      </div>
    </div>
  );
}
