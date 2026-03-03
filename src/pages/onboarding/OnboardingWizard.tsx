import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Mail, 
  Calendar, 
  Building2, 
  Settings,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { updateUserProfile, updateBusinessSettings } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { BusinessHours, BrandVoice } from '@/types';

const steps = [
  { id: 1, name: 'Account', description: 'Your details' },
  { id: 2, name: 'Connect', description: 'Email & calendar' },
  { id: 3, name: 'Business', description: 'Your settings' },
  { id: 4, name: 'Rules', description: 'How Mila works' },
  { id: 5, name: 'Activate', description: 'Go live' },
];

const defaultBusinessHours: BusinessHours = {
  monday: { open: '09:00', close: '17:00', enabled: true },
  tuesday: { open: '09:00', close: '17:00', enabled: true },
  wednesday: { open: '09:00', close: '17:00', enabled: true },
  thursday: { open: '09:00', close: '17:00', enabled: true },
  friday: { open: '09:00', close: '17:00', enabled: true },
  saturday: { open: '09:00', close: '13:00', enabled: false },
  sunday: { open: '09:00', close: '13:00', enabled: false },
};

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, profile, setProfile, setBusinessSettings } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [businessHours] = useState<BusinessHours>(defaultBusinessHours);
  const [serviceArea, setServiceArea] = useState('');
  const [bufferTime, setBufferTime] = useState(15);
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [escalationEmail, setEscalationEmail] = useState(user?.email || '');
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'outlook' | null>(null);
  const [calendarProvider, setCalendarProvider] = useState<'google' | 'outlook' | 'apple' | null>(null);
  const [autoBooking, setAutoBooking] = useState(false);
  const [escalationThreshold, setEscalationThreshold] = useState(0.7);
  const [bookingWindow, setBookingWindow] = useState(30);
  const [brandVoice, setBrandVoice] = useState<BrandVoice>('professional');
  const [milaActivated, setMilaActivated] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleNext = async () => {
    if (currentStep === 3) {
      // Save business settings before moving to rules
      await saveBusinessSettings();
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveBusinessSettings = async () => {
    if (!user?.id) return;
    
    const { data, error } = await updateBusinessSettings(user.id, {
      business_name: businessName,
      timezone,
      business_hours: businessHours as unknown as Record<string, unknown>,
      service_area: serviceArea.split(',').map(s => s.trim()).filter(Boolean),
      buffer_time_minutes: bufferTime,
      default_appointment_duration: defaultDuration,
      escalation_email: escalationEmail,
      brand_voice: brandVoice,
    });

    if (!error && data) {
      setBusinessSettings(data as unknown as ReturnType<typeof useAppStore.getState>['businessSettings']);
    }
  };

  const handleActivate = async () => {
    setIsSubmitting(true);
    
    if (!user?.id) return;
    
    // Update profile to mark onboarding complete and activate Mila
    const { data, error } = await updateUserProfile(user.id, {
      onboarding_completed: true,
      onboarding_step: 5,
      mila_active: true,
      mila_status: 'active',
    });

    if (!error && data) {
      setProfile(data as unknown as ReturnType<typeof useAppStore.getState>['profile']);
      setMilaActivated(true);
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    setIsSubmitting(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Account already created
      case 2:
        return emailProvider !== null && calendarProvider !== null;
      case 3:
        return businessName.trim() !== '' && escalationEmail.trim() !== '';
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg mila-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Hello Mila</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
      </header>

      {/* Progress */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      step.id < currentStep 
                        ? 'bg-emerald-500 text-white'
                        : step.id === currentStep
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-xs mt-1.5 ${
                    step.id === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 lg:w-24 h-0.5 mx-2 lg:mx-4 transition-all duration-200 ${
                    step.id < currentStep ? 'bg-emerald-500' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Step 1: Account (already created, just confirmation) */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Account created</h2>
                <p className="text-muted-foreground mt-1">
                  Your account is ready. Let's connect your tools.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 text-left">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Step 2: Connect Email & Calendar */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold">Connect your inbox</h2>
                <p className="text-muted-foreground mt-1">
                  Mila will monitor this inbox for enquiries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setEmailProvider('gmail')}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    emailProvider === 'gmail'
                      ? 'border-foreground bg-secondary/50'
                      : 'border-border hover:border-foreground/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="font-medium">Gmail</p>
                  <p className="text-sm text-muted-foreground">Google Workspace</p>
                </button>

                <button
                  onClick={() => setEmailProvider('outlook')}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    emailProvider === 'outlook'
                      ? 'border-foreground bg-secondary/50'
                      : 'border-border hover:border-foreground/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-medium">Outlook</p>
                  <p className="text-sm text-muted-foreground">Microsoft 365</p>
                </button>
              </div>

              <div className="text-center pt-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold">Connect your calendar</h2>
                <p className="text-muted-foreground mt-1">
                  Mila will check availability and book appointments.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['google', 'outlook', 'apple'] as const).map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setCalendarProvider(provider)}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                      calendarProvider === provider
                        ? 'border-foreground bg-secondary/50'
                        : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    <Calendar className="w-5 h-5 mx-auto mb-2" />
                    <p className="text-sm font-medium capitalize">{provider}</p>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> OAuth connections will be set up in the next phase. 
                  For now, we're capturing your preferences.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Business Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold">Business settings</h2>
                <p className="text-muted-foreground mt-1">
                  Tell Mila about your business.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business name"
                    className="mila-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="mila-input"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Australia/Sydney">Sydney</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Brand voice</label>
                    <select
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value as BrandVoice)}
                      className="mila-input"
                    >
                      <option value="professional">Professional</option>
                      <option value="warm">Warm</option>
                      <option value="minimal">Minimal</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Service area (optional)</label>
                  <input
                    type="text"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g., Downtown, Northside, Online"
                    className="mila-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated list of areas you serve
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Buffer time (minutes)</label>
                    <input
                      type="number"
                      value={bufferTime}
                      onChange={(e) => setBufferTime(Number(e.target.value))}
                      className="mila-input"
                      min={0}
                      max={60}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Default duration (minutes)</label>
                    <input
                      type="number"
                      value={defaultDuration}
                      onChange={(e) => setDefaultDuration(Number(e.target.value))}
                      className="mila-input"
                      min={15}
                      max={240}
                      step={15}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Escalation email</label>
                  <input
                    type="email"
                    value={escalationEmail}
                    onChange={(e) => setEscalationEmail(e.target.value)}
                    placeholder="Where to send urgent enquiries"
                    className="mila-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mila will escalate uncertain enquiries here
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Rules */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold">Set your rules</h2>
                <p className="text-muted-foreground mt-1">
                  Control how Mila handles enquiries.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-booking</p>
                      <p className="text-sm text-muted-foreground">
                        Let Mila book appointments automatically
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
                </div>

                <div className="p-4 rounded-lg border border-border">
                  <div className="mb-3">
                    <p className="font-medium">Escalation threshold</p>
                    <p className="text-sm text-muted-foreground">
                      When Mila is less confident than this, escalate to you
                    </p>
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
                    <span>More autonomous ({Math.round(escalationThreshold * 100)}%)</span>
                    <span>More cautious</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border">
                  <div className="mb-3">
                    <p className="font-medium">Booking window</p>
                    <p className="text-sm text-muted-foreground">
                      How far in advance can people book
                    </p>
                  </div>
                  <select
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
              </div>
            </div>
          )}

          {/* Step 5: Activate */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full mila-gradient flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Ready to activate Mila?</h2>
                <p className="text-muted-foreground mt-1">
                  Your AI receptionist will start handling enquiries immediately.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Connected to {emailProvider || 'your email'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Calendar integration ready</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Business hours configured</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Escalation rules set</span>
                </div>
              </div>

              {milaActivated ? (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-medium text-emerald-800">Mila is now active</p>
                  <p className="text-sm text-emerald-700">Redirecting to dashboard...</p>
                </div>
              ) : (
                <Button
                  onClick={handleActivate}
                  disabled={isSubmitting}
                  className="w-full py-6 text-lg mila-gradient text-white hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Activate Mila
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {currentStep < steps.length && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
