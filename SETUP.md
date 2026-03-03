# Hello Mila - Setup Guide

This guide will walk you through setting up the Hello Mila SaaS application.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Stripe account (for billing)
- Google Cloud account (for Gmail/Google Calendar)
- Microsoft Azure account (for Outlook/Outlook Calendar)
- OpenAI API key

## Phase 1: Supabase Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Create a new project named "Hello Mila"
3. Wait for the database to be provisioned

### 2. Run Database Migrations

In the Supabase SQL Editor, run the following SQL to create the database schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  business_name TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  phone TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  subscription_status TEXT DEFAULT 'trialing',
  subscription_tier TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  mila_active BOOLEAN DEFAULT FALSE,
  mila_status TEXT DEFAULT 'setup',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business settings
CREATE TABLE business_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  business_name TEXT DEFAULT '',
  business_hours JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'America/New_York',
  service_area TEXT[] DEFAULT '{}',
  buffer_time_minutes INTEGER DEFAULT 15,
  default_appointment_duration INTEGER DEFAULT 60,
  escalation_email TEXT,
  escalation_phone TEXT,
  auto_booking_enabled BOOLEAN DEFAULT FALSE,
  require_deposit BOOLEAN DEFAULT FALSE,
  deposit_amount INTEGER,
  allowed_booking_window_days INTEGER DEFAULT 30,
  brand_voice TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Integrations
CREATE TABLE integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected',
  connected_at TIMESTAMP WITH TIME ZONE,
  disconnected_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Email threads
CREATE TABLE email_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  external_thread_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  status TEXT DEFAULT 'new',
  classification TEXT DEFAULT 'general',
  lead_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email messages
CREATE TABLE email_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES email_threads(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  external_message_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  service_interest TEXT,
  notes TEXT,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  lead_id UUID REFERENCES leads(id),
  thread_id UUID REFERENCES email_threads(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  calendar_provider TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT FALSE,
  follow_up_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs / Knowledge Base
CREATE TABLE faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routing rules
CREATE TABLE routing_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value TEXT NOT NULL,
  action TEXT NOT NULL,
  action_value TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message templates
CREATE TABLE message_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own settings" ON business_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own integrations" ON integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own threads" ON email_threads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own messages" ON email_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own bookings" ON bookings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own FAQs" ON faqs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own rules" ON routing_rules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own logs" ON activity_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own templates" ON message_templates
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO user_profiles (id, trial_ends_at, mila_status)
  VALUES (NEW.id, NOW() + INTERVAL '14 days', 'setup');
  
  INSERT INTO business_settings (user_id, business_name, timezone)
  VALUES (NEW.id, '', 'America/New_York');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. Get Supabase Credentials

1. Go to Project Settings → API
2. Copy the "URL" and "anon public" key
3. Add to your `.env` file:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Phase 2: Stripe Setup

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. Complete your account setup

### 2. Create Products and Prices

1. In the Stripe Dashboard, go to Products
2. Create three products:
   - Starter ($99/month)
   - Professional ($299/month) 
   - Enterprise ($799/month)
3. Copy the Price IDs to your `.env` file

### 3. Setup Webhook

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-app.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `.env`

### 4. Get API Keys

1. Go to Developers → API keys
2. Copy Publishable key and Secret key to `.env`

## Phase 3: Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Gmail API
   - Google Calendar API

### 2. Configure OAuth Consent Screen

1. Go to APIs & Services → OAuth consent screen
2. Select "External" user type
3. Fill in app information:
   - App name: Hello Mila
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Add test users (your email)

### 3. Create OAuth Credentials

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: Web application
4. Name: Hello Mila Web
5. Authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback` (development)
   - `https://your-app.com/auth/google/callback` (production)
6. Copy Client ID and Client Secret to `.env`

## Phase 4: Microsoft Azure Setup

### 1. Register Application

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Navigate to Azure Active Directory → App registrations
3. Click "New registration"
4. Name: Hello Mila
5. Supported account types: Accounts in any organizational directory
6. Redirect URI:
   - Platform: Web
   - URI: `http://localhost:5173/auth/microsoft/callback`
7. Click Register

### 2. Configure API Permissions

1. Go to API permissions
2. Add permissions:
   - Microsoft Graph → Delegated permissions:
     - `Mail.Read`
     - `Mail.Send`
     - `Calendars.Read`
     - `Calendars.ReadWrite`
     - `User.Read`
3. Click "Grant admin consent"

### 3. Create Client Secret

1. Go to Certificates & secrets
2. Click "New client secret"
3. Name: Hello Mila Secret
4. Expires: 24 months
5. Copy the secret value to `.env`

### 4. Copy Application ID

1. Go to Overview
2. Copy "Application (client) ID" to `.env` as `MICROSOFT_CLIENT_ID`

## Phase 5: OpenAI Setup

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up and create an API key
3. Copy the API key to `.env`

## Phase 6: Run the Application

### 1. Install Dependencies

```bash
cd /mnt/okcomputer/output/app
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Phase 7: Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### 3. Update Environment Variables

Add all environment variables to your Vercel project settings.

### 4. Update Redirect URIs

Update Google and Microsoft OAuth redirect URIs to your production domain.

## Troubleshooting

### Common Issues

1. **Supabase connection failed**
   - Check URL and anon key are correct
   - Ensure database migrations were run

2. **OAuth redirect errors**
   - Verify redirect URIs match exactly
   - Check protocol (http vs https)

3. **Stripe webhook failures**
   - Ensure webhook endpoint is publicly accessible
   - Verify webhook secret is correct

## Next Steps

After setup is complete:

1. Test the signup flow
2. Complete the onboarding wizard
3. Connect Gmail or Outlook
4. Connect a calendar
5. Send a test enquiry
6. Verify Mila responds correctly

## Support

For issues or questions:
- Check the logs in Vercel/Supabase
- Review the error messages in the browser console
- Verify all environment variables are set correctly
