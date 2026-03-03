import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  User, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  MoreVertical
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getEmailThread } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EmailThread, EmailMessage } from '@/types';

export function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [thread, setThread] = useState<EmailThread | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const loadThread = async () => {
      if (!threadId || !user?.id) return;
      
      setIsLoading(true);
      const { data } = await getEmailThread(threadId);
      if (data) {
        setThread(data as unknown as EmailThread);
        setMessages((data as unknown as { email_messages: EmailMessage[] }).email_messages || []);
      }
      setIsLoading(false);
    };

    loadThread();
  }, [threadId, user]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" />New</span>;
      case 'responded':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Responded</span>;
      case 'escalated':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Escalated</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Processing</span>;
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    // Send reply
    // This would call the API to send a reply
    setReplyText('');
  };

  const handleConvertToLead = async () => {
    if (!thread) return;
    
    // Create lead from thread
    // This would call the API to create a lead
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">Conversation not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This conversation may have been deleted or you don't have access.
        </p>
        <Button onClick={() => navigate('/inbox')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to inbox
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/inbox')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight truncate max-w-md">
              {thread.subject}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(thread.status)}
              <span className="text-sm text-muted-foreground">
                {thread.from_email}
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as closed
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlertCircle className="w-4 h-4 mr-2" />
              Escalate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleConvertToLead}>
              <User className="w-4 h-4 mr-2" />
              Convert to lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-lg font-medium">
                {thread.from_name?.charAt(0) || thread.from_email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{thread.from_name || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">{thread.from_email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No messages in this thread</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card 
              key={message.id}
              className={message.direction === 'outbound' ? 'ml-8 lg:ml-16' : 'mr-8 lg:mr-16'}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.direction === 'outbound' 
                        ? 'bg-emerald-100' 
                        : 'bg-secondary'
                    }`}>
                      {message.direction === 'outbound' ? (
                        <span className="text-xs font-medium text-emerald-700">M</span>
                      ) : (
                        <span className="text-xs font-medium">
                          {thread.from_name?.charAt(0) || thread.from_email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {message.direction === 'outbound' ? 'Mila' : (thread.from_name || thread.from_email)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                  {message.ai_generated && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
                      AI Generated
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.ai_confidence && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Confidence: {Math.round(message.ai_confidence * 100)}%
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Box */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Mila will learn from your replies
              </p>
              <Button 
                onClick={handleSendReply}
                disabled={!replyText.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send reply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Info */}
      {thread.classification === 'booking_request' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Booking Information</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This enquiry was classified as a booking request. Mila will check availability and respond with available time slots.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
