import { useState, useEffect } from 'react';
import { Building2, Clock, MapPin, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getBusinessSettings, updateBusinessSettings } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BusinessHours } from '@/types';

const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

const defaultHours: BusinessHours = {
  monday: { open: '09:00', close: '17:00', enabled: true },
  tuesday: { open: '09:00', close: '17:00', enabled: true },
  wednesday: { open: '09:00', close: '17:00', enabled: true },
  thursday: { open: '09:00', close: '17:00', enabled: true },
  friday: { open: '09:00', close: '17:00', enabled: true },
  saturday: { open: '09:00', close: '13:00', enabled: false },
  sunday: { open: '09:00', close: '13:00', enabled: false },
};

export function BusinessSettingsPage() {
  const { user, setBusinessSettings } = useAppStore();
  
  const [businessName, setBusinessName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [serviceArea, setServiceArea] = useState('');
  const [bufferTime, setBufferTime] = useState(15);
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultHours);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      const { data } = await getBusinessSettings(user.id);
      
      if (data) {
        setBusinessName((data as { business_name?: string }).business_name || '');
        setTimezone((data as { timezone?: string }).timezone || 'America/New_York');
        setServiceArea(((data as { service_area?: string[] }).service_area || []).join(', '));
        setBufferTime((data as { buffer_time_minutes?: number }).buffer_time_minutes || 15);
        setDefaultDuration((data as { default_appointment_duration?: number }).default_appointment_duration || 60);
        setBusinessHours(((data as { business_hours?: BusinessHours }).business_hours) || defaultHours);
      }
      
      setIsLoading(false);
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setMessage(null);
    
    const { data, error } = await updateBusinessSettings(user.id, {
      business_name: businessName,
      timezone,
      service_area: serviceArea.split(',').map(s => s.trim()).filter(Boolean),
      buffer_time_minutes: bufferTime,
      default_appointment_duration: defaultDuration,
      business_hours: businessHours as unknown as Record<string, unknown>,
    });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (data) {
      setBusinessSettings(data as unknown as ReturnType<typeof useAppStore.getState>['businessSettings']);
      setMessage({ type: 'success', text: 'Business settings saved successfully' });
    }
    
    setIsSaving(false);
  };

  const updateDayHours = (day: keyof BusinessHours, field: 'open' | 'close' | 'enabled', value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <CardTitle className="text-base">Business Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mila-input"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceArea">Service area</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="serviceArea"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g., Downtown, Northside, Online"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Comma-separated list of areas you serve
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle className="text-base">Business Hours</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {days.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-24">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={businessHours[key as keyof BusinessHours].enabled}
                      onChange={(e) => updateDayHours(key as keyof BusinessHours, 'enabled', e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className={`text-sm ${businessHours[key as keyof BusinessHours].enabled ? '' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={businessHours[key as keyof BusinessHours].open}
                    onChange={(e) => updateDayHours(key as keyof BusinessHours, 'open', e.target.value)}
                    disabled={!businessHours[key as keyof BusinessHours].enabled}
                    className="mila-input py-1.5 px-2 text-sm w-28 disabled:opacity-50"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={businessHours[key as keyof BusinessHours].close}
                    onChange={(e) => updateDayHours(key as keyof BusinessHours, 'close', e.target.value)}
                    disabled={!businessHours[key as keyof BusinessHours].enabled}
                    className="mila-input py-1.5 px-2 text-sm w-28 disabled:opacity-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appointment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bufferTime">Buffer time (minutes)</Label>
              <Input
                id="bufferTime"
                type="number"
                value={bufferTime}
                onChange={(e) => setBufferTime(Number(e.target.value))}
                min={0}
                max={60}
              />
              <p className="text-xs text-muted-foreground">
                Time between appointments
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Default duration (minutes)</Label>
              <Input
                id="defaultDuration"
                type="number"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                min={15}
                max={240}
                step={15}
              />
              <p className="text-xs text-muted-foreground">
                Default appointment length
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </div>
  );
}
