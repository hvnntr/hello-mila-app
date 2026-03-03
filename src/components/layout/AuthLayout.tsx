import { Outlet, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAppStore();

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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-secondary/30 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl mila-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Hello Mila</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "Mila has transformed how we handle enquiries. Our response time dropped from hours to seconds, and bookings increased by 40%."
          </blockquote>
          <div>
            <p className="font-medium">Sarah Mitchell</p>
            <p className="text-sm text-muted-foreground">Owner, Mitchell Dental Care</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>Trusted by 500+ businesses</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Enterprise-grade security</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>24/7 AI Receptionist</span>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Logo */}
        <div className="lg:hidden p-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg mila-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Hello Mila</span>
          </div>
        </div>

        {/* Auth Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
