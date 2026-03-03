import { useState } from 'react';
import { 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { createOrUpdateIntegration } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { IntegrationProvider } from '@/types';

interface IntegrationConfig {
  id: IntegrationProvider;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  category: 'email' | 'calendar';
}

const integrations: IntegrationConfig[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail inbox for Mila to monitor',
    icon: Mail,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    category: 'email',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Connect your Microsoft 365 email',
    icon: Mail,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'email',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Check availability and create events',
    icon: Calendar,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'calendar',
  },
  {
    id: 'outlook_calendar',
    name: 'Outlook Calendar',
    description: 'Microsoft 365 calendar integration',
    icon: Calendar,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'calendar',
  },
  {
    id: 'apple_calendar',
    name: 'Apple Calendar',
    description: 'iCloud calendar via CalDAV or sync',
    icon: Calendar,
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    category: 'calendar',
  },
];

export function IntegrationsSettings() {
  const { user, integrations: connectedIntegrations, updateIntegration } = useAppStore();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showAppleDialog, setShowAppleDialog] = useState(false);

  const getIntegrationStatus = (provider: string) => {
    const integration = connectedIntegrations.find(i => i.provider === provider);
    return integration?.status || 'disconnected';
  };

  const handleConnect = async (config: IntegrationConfig) => {
    if (!user?.id) return;

    // For Apple Calendar, show special dialog
    if (config.id === 'apple_calendar') {
      setShowAppleDialog(true);
      return;
    }

    setIsConnecting(config.id);

    // Simulate OAuth flow (in production, this would redirect to OAuth)
    setTimeout(async () => {
      const { data, error } = await createOrUpdateIntegration(
        user.id,
        config.id,
        'connected',
        { connected_at: new Date().toISOString() }
      );

      if (!error && data) {
        updateIntegration(data as unknown as ReturnType<typeof useAppStore.getState>['integrations'][0]);
      }

      setIsConnecting(null);
    }, 1500);
  };

  const handleDisconnect = async (config: IntegrationConfig) => {
    if (!user?.id) return;

    const { data, error } = await createOrUpdateIntegration(
      user.id,
      config.id,
      'disconnected',
      { disconnected_at: new Date().toISOString() }
    );

    if (!error && data) {
      updateIntegration(data as unknown as ReturnType<typeof useAppStore.getState>['integrations'][0]);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
            <XCircle className="w-3 h-3" />
            Not connected
          </span>
        );
    }
  };

  const emailIntegrations = integrations.filter(i => i.category === 'email');
  const calendarIntegrations = integrations.filter(i => i.category === 'calendar');

  return (
    <div className="space-y-8">
      {/* Email Integrations */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Email</h3>
        <div className="space-y-3">
          {emailIntegrations.map((config) => {
            const status = getIntegrationStatus(config.id);
            const Icon = config.icon;
            
            return (
              <Card key={config.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{config.name}</p>
                          {renderStatusBadge(status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      {status === 'connected' ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleConnect(config)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(config)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnect(config)}
                          disabled={isConnecting === config.id}
                        >
                          {isConnecting === config.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Calendar Integrations */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Calendar</h3>
        <div className="space-y-3">
          {calendarIntegrations.map((config) => {
            const status = getIntegrationStatus(config.id);
            const Icon = config.icon;
            
            return (
              <Card key={config.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{config.name}</p>
                          {renderStatusBadge(status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      {status === 'connected' ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleConnect(config)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(config)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnect(config)}
                          disabled={isConnecting === config.id}
                        >
                          {isConnecting === config.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Apple Calendar Dialog */}
      <Dialog open={showAppleDialog} onOpenChange={setShowAppleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Connect Apple Calendar</DialogTitle>
            <DialogDescription>
              Apple Calendar requires a different connection method
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
              <h4 className="font-medium text-violet-900 mb-2">Option 1: CalDAV (Recommended)</h4>
              <p className="text-sm text-violet-800 mb-3">
                Connect directly using an app-specific password from your Apple ID.
              </p>
              <ol className="text-sm text-violet-800 space-y-1 list-decimal list-inside">
                <li>Go to appleid.apple.com</li>
                <li>Sign in and go to "App-Specific Passwords"</li>
                <li>Generate a new password for "Hello Mila"</li>
                <li>Enter the password below</li>
              </ol>
              <Button className="mt-4 w-full" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Apple ID
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-secondary">
              <h4 className="font-medium mb-2">Option 2: Sync via Google/Outlook</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sync your Apple Calendar to Google or Outlook first, then connect that calendar.
              </p>
              <Button variant="outline" className="w-full">
                View sync instructions
              </Button>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAppleDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
