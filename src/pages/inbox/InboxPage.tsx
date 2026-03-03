import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  Filter, 
  ChevronRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getEmailThreads } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { EmailThread } from '@/types';

type FilterStatus = 'all' | 'new' | 'responded' | 'escalated' | 'closed';

export function InboxPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<EmailThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThreads = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      const { data } = await getEmailThreads(user.id, 100);
      if (data) {
        setThreads(data as unknown as EmailThread[]);
        setFilteredThreads(data as unknown as EmailThread[]);
      }
      setIsLoading(false);
    };

    loadThreads();
  }, [user]);

  useEffect(() => {
    let filtered = threads;
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(t => t.status === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(query) ||
        t.from_email.toLowerCase().includes(query) ||
        t.from_name?.toLowerCase().includes(query)
      );
    }
    
    setFilteredThreads(filtered);
  }, [threads, activeFilter, searchQuery]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      case 'responded':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'escalated':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'closed':
        return <div className="w-2 h-2 rounded-full bg-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'enquiry':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">Enquiry</span>;
      case 'booking_request':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">Booking</span>;
      case 'general':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">General</span>;
      case 'spam':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700">Spam</span>;
      default:
        return null;
    }
  };

  const filterOptions: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: threads.length },
    { value: 'new', label: 'New', count: threads.filter(t => t.status === 'new').length },
    { value: 'responded', label: 'Responded', count: threads.filter(t => t.status === 'responded').length },
    { value: 'escalated', label: 'Escalated', count: threads.filter(t => t.status === 'escalated').length },
    { value: 'closed', label: 'Closed', count: threads.filter(t => t.status === 'closed').length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading inbox...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage enquiries and conversations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send test enquiry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by subject, sender, or email..."
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

      {/* Threads List */}
      {filteredThreads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No conversations yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery || activeFilter !== 'all'
                ? 'No conversations match your filters. Try adjusting your search.'
                : 'Mila will handle enquiries here once they arrive in your connected inbox.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => navigate(`/inbox/${thread.id}`)}
              className="w-full p-4 rounded-lg bg-card border border-border hover:border-foreground/20 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">
                    {thread.from_name?.charAt(0) || thread.from_email.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">
                      {thread.from_name || thread.from_email}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {thread.from_email}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatTime(thread.last_message_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm mt-0.5 truncate">
                    {thread.subject}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(thread.status)}
                      <span className={`text-xs capitalize ${
                        thread.status === 'new' ? 'text-blue-600' :
                        thread.status === 'responded' ? 'text-emerald-600' :
                        thread.status === 'escalated' ? 'text-amber-600' :
                        'text-muted-foreground'
                      }`}>
                        {thread.status}
                      </span>
                    </div>
                    {getClassificationBadge(thread.classification)}
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
