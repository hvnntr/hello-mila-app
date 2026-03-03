import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Link2, 
  Building2, 
  SlidersHorizontal, 
  FileText, 
  BookOpen, 
  CreditCard 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { name: 'General', href: '/settings/general', icon: User },
  { name: 'Integrations', href: '/settings/integrations', icon: Link2 },
  { name: 'Business', href: '/settings/business', icon: Building2 },
  { name: 'Rules', href: '/settings/rules', icon: SlidersHorizontal },
  { name: 'Templates', href: '/settings/templates', icon: FileText },
  { name: 'Knowledge Base', href: '/settings/knowledge', icon: BookOpen },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard },
];

export function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {settingsNav.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
