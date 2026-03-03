import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  UserProfile, 
  BusinessSettings, 
  Integration, 
  DashboardStats,
  OnboardingState 
} from '@/types';

interface AppState {
  // Auth
  user: User | null;
  session: unknown | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // User Data
  profile: UserProfile | null;
  businessSettings: BusinessSettings | null;
  integrations: Integration[];
  
  // Dashboard
  dashboardStats: DashboardStats | null;
  
  // Onboarding
  onboardingState: OnboardingState;
  
  // UI State
  sidebarOpen: boolean;
  currentPage: string;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: unknown | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setProfile: (profile: UserProfile | null) => void;
  setBusinessSettings: (settings: BusinessSettings | null) => void;
  setIntegrations: (integrations: Integration[]) => void;
  updateIntegration: (integration: Integration) => void;
  setDashboardStats: (stats: DashboardStats | null) => void;
  setOnboardingState: (state: Partial<OnboardingState>) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  reset: () => void;
}

const initialOnboardingState: OnboardingState = {
  currentStep: 1,
  completedSteps: [],
  account: null,
  business: null,
  integrations: {
    email: null,
    calendar: null,
  },
  rules: null,
};

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  profile: null,
  businessSettings: null,
  integrations: [],
  dashboardStats: null,
  onboardingState: initialOnboardingState,
  sidebarOpen: true,
  currentPage: 'dashboard',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (value) => set({ isLoading: value }),
      
      setProfile: (profile) => set({ profile }),
      setBusinessSettings: (settings) => set({ businessSettings: settings }),
      
      setIntegrations: (integrations) => set({ integrations }),
      updateIntegration: (integration) => {
        const { integrations } = get();
        const index = integrations.findIndex(
          (i) => i.provider === integration.provider
        );
        if (index >= 0) {
          const updated = [...integrations];
          updated[index] = integration;
          set({ integrations: updated });
        } else {
          set({ integrations: [...integrations, integration] });
        }
      },
      
      setDashboardStats: (stats) => set({ dashboardStats: stats }),
      
      setOnboardingState: (state) => {
        const { onboardingState } = get();
        set({
          onboardingState: { ...onboardingState, ...state },
        });
      },
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentPage: (page) => set({ currentPage: page }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'hello-mila-storage',
      partialize: (state) => ({
        onboardingState: state.onboardingState,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useProfile = () => useAppStore((state) => state.profile);
export const useBusinessSettings = () => useAppStore((state) => state.businessSettings);
export const useIntegrations = () => useAppStore((state) => state.integrations);
export const useDashboardStats = () => useAppStore((state) => state.dashboardStats);
export const useOnboardingState = () => useAppStore((state) => state.onboardingState);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
