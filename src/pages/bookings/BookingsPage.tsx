import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getBookings } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Booking } from '@/types';

type BookingStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'canceled';
type ViewMode = 'list' | 'calendar';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-gray-100 text-gray-700',
  canceled: 'bg-red-50 text-red-700',
};

export function BookingsPage() {
  const { user } = useAppStore();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      const { data } = await getBookings(user.id, 100);
      if (data) {
        setBookings(data as unknown as Booking[]);
        setFilteredBookings(data as unknown as Booking[]);
      }
      setIsLoading(false);
    };

    loadBookings();
  }, [user]);

  useEffect(() => {
    let filtered = bookings;
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(b => b.status === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, activeFilter, searchQuery]);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMinutes = Math.round((endTime - startTime) / 60000);
    return `${durationMinutes} min`;
  };

  const filterOptions: { value: BookingStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: bookings.length },
    { value: 'scheduled', label: 'Scheduled', count: bookings.filter(b => b.status === 'scheduled').length },
    { value: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { value: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { value: 'canceled', label: 'Canceled', count: bookings.filter(b => b.status === 'canceled').length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage appointments and schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Calendar
            </button>
          </div>
          <Button size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            New booking
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
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

      {/* Calendar Navigation (when in calendar view) */}
      {viewMode === 'calendar' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-medium min-w-[150px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            Today
          </Button>
        </div>
      )}

      {/* Bookings List */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No bookings yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchQuery || activeFilter !== 'all'
                    ? 'No bookings match your filters. Try adjusting your search.'
                    : 'Bookings will appear here when Mila schedules appointments.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-sm transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-secondary flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground uppercase">
                          {new Date(booking.start_time).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-semibold">
                          {new Date(booking.start_time).getDate()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{booking.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[booking.status] || 'bg-secondary text-muted-foreground'}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </span>
                          <span className="text-border">|</span>
                          <span>{getDuration(booking.start_time, booking.end_time)}</span>
                        </div>
                        
                        {booking.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {booking.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark as completed
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Calendar View Placeholder */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Calendar view</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Full calendar view coming soon. Use list view for now.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
