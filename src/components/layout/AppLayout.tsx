import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  Calendar, 
  BookOpen, 
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getUserProfile, getBusinessSettings, getIntegrations } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    profile,
    sidebarOpen, 
    setSidebarOpen,
    setProfile,
    setBusinessSettings,
    setIntegrations,
    setCurrentPage
  } = useAppStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      const { data: profileData } = await getUserProfile(user.id);
      if (profileData) {
        setProfile(profileData as unknown as ReturnType<typeof useAppStore.getState>['profile']);
        
        // Redirect to onboarding if not completed
        if (!(profileData as unknown as { onboarding_completed?: boolean }).onboarding_completed) {
          navigate('/onboarding');
          return;
        }
      }
      
      const { data: settingsData } = await getBusinessSettings(user.id);
      if (settingsData) {
        setBusinessSettings(settingsData as unknown as ReturnType<typeof useAppStore.getState>['businessSettings']);
      }
      
      const { data: integrationsData } = await getIntegrations(user.id);
      if (integrationsData) {
        setIntegrations(integrationsData as unknown as ReturnType<typeof useAppStore.getState>['integrations']);
      }
    };

    loadUserData();
  }, [user, setProfile, setBusinessSettings, setIntegrations, navigate]);

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    setCurrentPage(path || 'dashboard');
  }, [location, setCurrentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg mila-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sidebar-foreground">Hello Mila</span>
          </button>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              Main
            </p>
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              System
            </p>
            {secondaryNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <button 
            onClick={() => navigate('/settings/general')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-medium">
                {profile?.business_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.business_name || user?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center px-4 border-b border-border bg-background sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg mila-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold">Hello Mila</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
