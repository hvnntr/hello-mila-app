# Hello Mila - AI Receptionist SaaS

A fully self-serve, autonomous SaaS platform that businesses can activate in ~5 minutes. Mila is your 24/7 AI Receptionist that handles inbound enquiries, qualifies leads, books appointments, and manages your calendar.

## Features

### Core AI Receptionist
- **Email Integration**: Connect Gmail or Outlook inboxes
- **Calendar Integration**: Google Calendar, Outlook Calendar, Apple Calendar support
- **AI-Powered Responses**: Instant, professional replies to enquiries
- **Lead Qualification**: Structured questions to qualify prospects
- **Appointment Booking**: Automatic calendar scheduling with buffer times
- **Escalation Handling**: Human-in-the-loop for uncertain messages
- **Activity Logging**: Complete audit trail of all actions

### CRM & Pipeline
- **Lead Management**: Track leads from enquiry to booked
- **Status Tracking**: New → Qualified → Booked → Completed
- **Contact Profiles**: Store customer information and notes
- **Booking Management**: View and manage appointments

### Knowledge Base
- **FAQ Management**: Add common questions and answers
- **Brand Voice**: Choose from Professional, Warm, Minimal, or Luxury tones
- **Custom Templates**: Personalize email responses

### Settings & Configuration
- **Business Hours**: Set your availability
- **Service Areas**: Define where you operate
- **Booking Rules**: Auto-booking, escalation thresholds, booking windows
- **Integrations**: Connect email and calendar providers

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Backend**: Supabase (Auth + Postgres + Real-time)
- **Billing**: Stripe (subscriptions)
- **AI**: OpenAI API

## Project Structure

```
src/
├── components/
│   ├── layout/          # App and Auth layouts
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase.ts      # Supabase client and helpers
│   ├── database.types.ts # Database type definitions
│   └── utils.ts         # Utility functions
├── pages/
│   ├── auth/            # Login, Signup
│   ├── onboarding/      # Onboarding wizard
│   ├── dashboard/       # Main dashboard
│   ├── inbox/           # Email threads
│   ├── crm/             # Leads management
│   ├── bookings/        # Appointments
│   ├── knowledge/       # Knowledge base
│   └── settings/        # All settings pages
├── stores/
│   └── appStore.ts      # Zustand store
├── types/
│   └── index.ts         # TypeScript types
└── App.tsx              # Main app with routing
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for billing)
- Google Cloud account (for Gmail/Calendar)
- Microsoft Azure account (for Outlook)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
cd /mnt/okcomputer/output/app
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173)

### Database Setup

Run the SQL migrations in `SETUP.md` to create the database schema in Supabase.

## Environment Variables

See `.env.example` for the complete list of required environment variables.

Key variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `OPENAI_API_KEY` - OpenAI API key

## Deployment

### Build for production:
```bash
npm run build
```

### Deploy to Vercel:
```bash
npm install -g vercel
vercel --prod
```

## User Flow

1. **Sign Up** → Create account with email/password
2. **Onboarding** (5 minutes):
   - Connect email (Gmail/Outlook)
   - Connect calendar (Google/Outlook/Apple)
   - Set business name, hours, timezone
   - Configure booking rules
3. **Activate Mila** → AI receptionist goes live
4. **Dashboard** → Monitor enquiries, leads, bookings

## Pricing

- **Starter**: $99/month - 500 emails, 1 inbox, 1 calendar
- **Professional**: $299/month - Unlimited emails, 3 inboxes, 3 calendars
- **Enterprise**: $799/month - Unlimited everything, API access, dedicated support

14-day free trial on all plans.

## License

Private - All rights reserved.

## Support

For setup assistance, see `SETUP.md` for detailed configuration instructions.
