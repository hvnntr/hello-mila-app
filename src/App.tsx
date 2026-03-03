import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCurrentUser, getSession } from '@/lib/supabase';
import { useAppStore } from '@/stores/appStore';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';

// Onboarding
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Inbox
import { InboxPage } from '@/pages/inbox/InboxPage';
import { ThreadDetailPage } from '@/pages/inbox/ThreadDetailPage';

// CRM
import { LeadsPage } from '@/pages/crm/LeadsPage';
import { LeadDetailPage } from '@/pages/crm/LeadDetailPage';

// Bookings
import { BookingsPage } from '@/pages/bookings/BookingsPage';

// Settings
import { SettingsLayout } from '@/pages/settings/SettingsLayout';
import { GeneralSettings } from '@/pages/settings/GeneralSettings';
import { IntegrationsSettings } from '@/pages/settings/IntegrationsSettings';
import { BusinessSettingsPage } from '@/pages/settings/BusinessSettingsPage';
import { RulesSettings } from '@/pages/settings/RulesSettings';
import { TemplatesSettings } from '@/pages/settings/TemplatesSettings';
import { KnowledgeBaseSettings } from '@/pages/settings/KnowledgeBaseSettings';
import { BillingSettings } from '@/pages/settings/BillingSettings';

// Knowledge Base
import { KnowledgeBasePage } from '@/pages/knowledge/KnowledgeBasePage';

function App() {
  const { setUser, setSession, setAuthenticated, setLoading, isAuthenticated } = useAppStore();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      const { session } = await getSession();
      if (session) {
        setSession(session);
        const { user } = await getCurrentUser();
        setUser(user as unknown as ReturnType<typeof useAppStore.getState>['user']);
        setAuthenticated(true);
      }
      
      setLoading(false);
    };

    initAuth();
  }, [setUser, setSession, setAuthenticated, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
        </Route>

        {/* Onboarding */}
        <Route 
          path="/onboarding" 
          element={
            isAuthenticated ? <OnboardingWizard /> : <Navigate to="/auth/login" />
          } 
        />

        {/* App Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Inbox */}
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:threadId" element={<ThreadDetailPage />} />
          
          {/* CRM */}
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailPage />} />
          
          {/* Bookings */}
          <Route path="/bookings" element={<BookingsPage />} />
          
          {/* Knowledge Base */}
          <Route path="/knowledge" element={<KnowledgeBasePage />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/settings/general" />} />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="integrations" element={<IntegrationsSettings />} />
            <Route path="business" element={<BusinessSettingsPage />} />
            <Route path="rules" element={<RulesSettings />} />
            <Route path="templates" element={<TemplatesSettings />} />
            <Route path="knowledge" element={<KnowledgeBaseSettings />} />
            <Route path="billing" element={<BillingSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
