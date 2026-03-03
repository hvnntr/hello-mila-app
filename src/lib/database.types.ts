export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          business_name: string | null;
          timezone: string;
          phone: string | null;
          onboarding_completed: boolean;
          onboarding_step: number;
          subscription_status: string;
          subscription_tier: string | null;
          trial_ends_at: string | null;
          mila_active: boolean;
          mila_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_name?: string | null;
          timezone?: string;
          phone?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          subscription_status?: string;
          subscription_tier?: string | null;
          trial_ends_at?: string | null;
          mila_active?: boolean;
          mila_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string | null;
          timezone?: string;
          phone?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          subscription_status?: string;
          subscription_tier?: string | null;
          trial_ends_at?: string | null;
          mila_active?: boolean;
          mila_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      business_settings: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_hours: Json;
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
          brand_voice: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name?: string;
          business_hours?: Json;
          timezone?: string;
          service_area?: string[];
          buffer_time_minutes?: number;
          default_appointment_duration?: number;
          escalation_email?: string | null;
          escalation_phone?: string | null;
          auto_booking_enabled?: boolean;
          require_deposit?: boolean;
          deposit_amount?: number | null;
          allowed_booking_window_days?: number;
          brand_voice?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_hours?: Json;
          timezone?: string;
          service_area?: string[];
          buffer_time_minutes?: number;
          default_appointment_duration?: number;
          escalation_email?: string | null;
          escalation_phone?: string | null;
          auto_booking_enabled?: boolean;
          require_deposit?: boolean;
          deposit_amount?: number | null;
          allowed_booking_window_days?: number;
          brand_voice?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          status: string;
          connected_at: string | null;
          disconnected_at: string | null;
          last_sync_at: string | null;
          error_message: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          status?: string;
          connected_at?: string | null;
          disconnected_at?: string | null;
          last_sync_at?: string | null;
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          status?: string;
          connected_at?: string | null;
          disconnected_at?: string | null;
          last_sync_at?: string | null;
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_threads: {
        Row: {
          id: string;
          user_id: string;
          external_thread_id: string;
          subject: string;
          from_email: string;
          from_name: string | null;
          status: string;
          classification: string;
          lead_id: string | null;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          external_thread_id: string;
          subject: string;
          from_email: string;
          from_name?: string | null;
          status?: string;
          classification?: string;
          lead_id?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          external_thread_id?: string;
          subject?: string;
          from_email?: string;
          from_name?: string | null;
          status?: string;
          classification?: string;
          lead_id?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_messages: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          external_message_id: string;
          direction: string;
          content: string;
          content_html: string | null;
          ai_generated: boolean;
          ai_confidence: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          user_id: string;
          external_message_id: string;
          direction: string;
          content: string;
          content_html?: string | null;
          ai_generated?: boolean;
          ai_confidence?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          user_id?: string;
          external_message_id?: string;
          direction?: string;
          content?: string;
          content_html?: string | null;
          ai_generated?: boolean;
          ai_confidence?: number | null;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string | null;
          phone: string | null;
          status: string;
          source: string | null;
          service_interest: string | null;
          notes: string | null;
          last_contact_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          status?: string;
          source?: string | null;
          service_interest?: string | null;
          notes?: string | null;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          status?: string;
          source?: string | null;
          service_interest?: string | null;
          notes?: string | null;
          last_contact_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
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
          status: string;
          reminder_sent: boolean;
          follow_up_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lead_id?: string | null;
          thread_id?: string | null;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          calendar_provider: string;
          external_event_id: string;
          status?: string;
          reminder_sent?: boolean;
          follow_up_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lead_id?: string | null;
          thread_id?: string | null;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          calendar_provider?: string;
          external_event_id?: string;
          status?: string;
          reminder_sent?: boolean;
          follow_up_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      faqs: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          answer: string;
          category?: string | null;
          tags?: string[];
          active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question?: string;
          answer?: string;
          category?: string | null;
          tags?: string[];
          active?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      routing_rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          condition_type: string;
          condition_value: string;
          action: string;
          action_value: string;
          priority: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          condition_type: string;
          condition_value: string;
          action: string;
          action_value: string;
          priority?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          condition_type?: string;
          condition_value?: string;
          action?: string;
          action_value?: string;
          priority?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          description: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          description: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          description?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      message_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          subject: string | null;
          content: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          subject?: string | null;
          content: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          subject?: string | null;
          content?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for Supabase responses
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
