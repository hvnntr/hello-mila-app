import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates as never)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getBusinessSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const updateBusinessSettings = async (userId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('business_settings')
    .update(updates as never)
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
};

export const getIntegrations = async (userId: string) => {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const getIntegration = async (userId: string, provider: string) => {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();
  return { data, error };
};

export const createOrUpdateIntegration = async (
  userId: string,
  provider: string,
  status: string,
  metadata: Record<string, unknown> = {}
) => {
  const { data, error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      provider,
      status,
      metadata,
      connected_at: status === 'connected' ? new Date().toISOString() : null,
    } as never, {
      onConflict: 'user_id,provider',
    })
    .select()
    .single();
  return { data, error };
};

// Email threads
export const getEmailThreads = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('email_threads')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const getEmailThread = async (threadId: string) => {
  const { data, error } = await supabase
    .from('email_threads')
    .select('*, email_messages(*)')
    .eq('id', threadId)
    .single();
  return { data, error };
};

// Leads
export const getLeads = async (userId: string, status?: string) => {
  let query = supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  return { data, error };
};

export const updateLead = async (leadId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('leads')
    .update(updates as never)
    .eq('id', leadId)
    .select()
    .single();
  return { data, error };
};

// Bookings
export const getBookings = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit);
  return { data, error };
};

// FAQs
export const getFAQs = async (userId: string) => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createFAQ = async (faq: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('faqs')
    .insert(faq as never)
    .select()
    .single();
  return { data, error };
};

export const updateFAQ = async (faqId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('faqs')
    .update(updates as never)
    .eq('id', faqId)
    .select()
    .single();
  return { data, error };
};

export const deleteFAQ = async (faqId: string) => {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', faqId);
  return { error };
};

// Activity logs
export const getActivityLogs = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

// Real-time subscriptions
export const subscribeToThreads = (userId: string, callback: (payload: unknown) => void) => {
  return supabase
    .channel('email_threads')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'email_threads',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToActivity = (userId: string, callback: (payload: unknown) => void) => {
  return supabase
    .channel('activity_logs')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};
