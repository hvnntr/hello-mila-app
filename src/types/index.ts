// User & Authentication
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  business_name: string | null;
  timezone: string;
  phone: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  subscription_status: SubscriptionStatus;
  subscription_tier: string | null;
  trial_ends_at: string | null;
  mila_active: boolean;
  mila_status: 'active' | 'paused' | 'error' | 'setup';
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'unpaid';

// Business Settings
export interface BusinessSettings {
  id: string;
  user_id: string;
  business_name: string;
  business_hours: BusinessHours;
  timezone: string;
  service_area: string[];
  buffer_time_minutes: number;
  default_appointment_duration: number;
  escalation_email: string | null;
  escalation_phone: string | null;
  auto_booking_enabled: boolean;
  require_deposit: boolean;
  deposit_amount: number | null;
  allowed_booking_window_days: number;
  brand_voice: BrandVoice;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monday: { open: string; close: string; enabled: boolean };
  tuesday: { open: string; close: string; enabled: boolean };
  wednesday: { open: string; close: string; enabled: boolean };
  thursday: { open: string; close: string; enabled: boolean };
  friday: { open: string; close: string; enabled: boolean };
  saturday: { open: string; close: string; enabled: boolean };
  sunday: { open: string; close: string; enabled: boolean };
}

export type BrandVoice = 'professional' | 'warm' | 'minimal' | 'luxury';

// Integrations
export interface Integration {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  connected_at: string | null;
  disconnected_at: string | null;
  last_sync_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
}

export type IntegrationProvider = 
  | 'gmail' 
  | 'outlook' 
  | 'google_calendar' 
  | 'outlook_calendar' 
  | 'apple_calendar';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

// Email & Threads
export interface EmailThread {
  id: string;
  user_id: string;
  external_thread_id: string;
  subject: string;
  from_email: string;
  from_name: string | null;
  status: ThreadStatus;
  classification: EmailClassification;
  lead_id: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export type ThreadStatus = 'new' | 'processing' | 'responded' | 'escalated' | 'closed';
export type EmailClassification = 'enquiry' | 'booking_request' | 'general' | 'spam' | 'uncertain';

export interface EmailMessage {
  id: string;
  thread_id: string;
  user_id: string;
  external_message_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  content_html: string | null;
  ai_generated: boolean;
  ai_confidence: number | null;
  created_at: string;
}

// Leads & CRM
export interface Lead {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: LeadStatus;
  source: string | null;
  service_interest: string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'qualified' | 'booked' | 'completed' | 'lost';

// Calendar & Bookings
export interface Booking {
  id: string;
  user_id: string;
  lead_id: string | null;
  thread_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  calendar_provider: string;
  external_event_id: string;
  status: BookingStatus;
  reminder_sent: boolean;
  follow_up_sent: boolean;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

// Knowledge Base / FAQs
export interface FAQ {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[];
  active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Routing Rules
export interface RoutingRule {
  id: string;
  user_id: string;
  name: string;
  condition_type: 'keyword' | 'suburb' | 'service' | 'time';
  condition_value: string;
  action: 'route_calendar' | 'route_team_member' | 'add_tag' | 'escalate';
  action_value: string;
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Activity Log
export interface ActivityLog {
  id: string;
  user_id: string;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ActivityType = 
  | 'email_received'
  | 'email_sent'
  | 'lead_created'
  | 'lead_updated'
  | 'booking_created'
  | 'booking_updated'
  | 'escalation'
  | 'integration_connected'
  | 'integration_error'
  | 'mila_activated'
  | 'mila_paused';

// Templates
export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  type: TemplateType;
  subject: string | null;
  content: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type TemplateType = 
  | 'initial_response'
  | 'booking_confirmation'
  | 'reminder'
  | 'follow_up'
  | 'escalation_notice';

// Reporting
export interface DailySummary {
  date: string;
  enquiries_received: number;
  bookings_created: number;
  escalations: number;
  response_time_avg: number;
  conversion_rate: number;
}

// Onboarding
export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  account: {
    email: string;
    password: string;
    fullName: string;
  } | null;
  business: {
    businessName: string;
    timezone: string;
    businessHours: BusinessHours;
    serviceArea: string[];
    bufferTime: number;
    defaultDuration: number;
    escalationEmail: string;
  } | null;
  integrations: {
    email: IntegrationProvider | null;
    calendar: IntegrationProvider | null;
  };
  rules: {
    autoBooking: boolean;
    escalationThreshold: number;
    bookingWindow: number;
  } | null;
}

// API Responses
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Dashboard Stats
export interface DashboardStats {
  enquiriesToday: number;
  enquiriesChange: number;
  bookingsToday: number;
  bookingsChange: number;
  responseTimeAvg: number;
  responseTimeChange: number;
  conversionRate: number;
  conversionRateChange: number;
  milaStatus: 'active' | 'paused' | 'error' | 'setup';
  pendingEscalations: number;
}
