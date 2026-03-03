import { useState } from 'react';
import { AlertTriangle, Calendar, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function RulesSettings() {
  const [autoBooking, setAutoBooking] = useState(false);
  const [escalationThreshold, setEscalationThreshold] = useState(0.7);
  const [bookingWindow, setBookingWindow] = useState(30);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [sendFollowUps, setSendFollowUps] = useState(true);

  const handleSave = async () => {
    // Save rules to database
    // This would update the business_settings table
  };

  return (
    <div className="space-y-6">
      {/* Auto-booking */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-base">Auto-booking</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable auto-booking</p>
              <p className="text-sm text-muted-foreground">
                Let Mila book appointments without confirmation
              </p>
            </div>
            <button
              onClick={() => setAutoBooking(!autoBooking)}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                autoBooking ? 'bg-emerald-500' : 'bg-border'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                autoBooking ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {!autoBooking && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Manual confirmation mode
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Mila will suggest available time slots but wait for the customer's confirmation before booking.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle className="text-base">Escalation Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Confidence threshold</Label>
              <span className="text-sm font-medium">{Math.round(escalationThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={0.95}
              step={0.05}
              value={escalationThreshold}
              onChange={(e) => setEscalationThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>More autonomous (50%)</span>
              <span>More cautious (95%)</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              When Mila's confidence is below this threshold, the enquiry will be escalated to you.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Window */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <CardTitle className="text-base">Booking Window</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bookingWindow" className="mb-2 block">
              How far in advance can people book?
            </Label>
            <select
              id="bookingWindow"
              value={bookingWindow}
              onChange={(e) => setBookingWindow(Number(e.target.value))}
              className="mila-input"
            >
              <option value={7}>1 week</option>
              <option value={14}>2 weeks</option>
              <option value={30}>1 month</option>
              <option value={60}>2 months</option>
              <option value={90}>3 months</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require confirmation</p>
              <p className="text-sm text-muted-foreground">
                Send confirmation emails for new bookings
              </p>
            </div>
            <button
              onClick={() => setRequireConfirmation(!requireConfirmation)}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                requireConfirmation ? 'bg-emerald-500' : 'bg-border'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                requireConfirmation ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Send reminders</p>
              <p className="text-sm text-muted-foreground">
                Remind customers before appointments
              </p>
            </div>
            <button
              onClick={() => setSendReminders(!sendReminders)}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                sendReminders ? 'bg-emerald-500' : 'bg-border'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                sendReminders ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Send follow-ups</p>
              <p className="text-sm text-muted-foreground">
                Request reviews after completed appointments
              </p>
            </div>
            <button
              onClick={() => setSendFollowUps(!sendFollowUps)}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                sendFollowUps ? 'bg-emerald-500' : 'bg-border'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                sendFollowUps ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
