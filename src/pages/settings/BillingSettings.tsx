import { useState } from 'react';
import { CreditCard, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    description: 'For small businesses just getting started',
    features: [
      '500 emails/month',
      '1 inbox connection',
      '1 calendar connection',
      'Basic CRM',
      'Email support',
    ],
    notIncluded: [
      'Priority support',
      'Custom templates',
      'API access',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    description: 'For growing businesses with more enquiries',
    features: [
      'Unlimited emails',
      '3 inbox connections',
      '3 calendar connections',
      'Advanced CRM',
      'Priority support',
      'Custom templates',
      'Knowledge base',
    ],
    notIncluded: [
      'API access',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    description: 'For large teams with complex needs',
    features: [
      'Unlimited everything',
      'Unlimited connections',
      'Advanced CRM + API',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    notIncluded: [],
  },
];

export function BillingSettings() {
  const { profile } = useAppStore();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = () => {
    switch (profile?.subscription_status) {
      case 'trialing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-violet-50 text-violet-700 border border-violet-200">
            <Sparkles className="w-3 h-3" />
            Trial
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3" />
            Active
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            Past due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
            Inactive
          </span>
        );
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    // Simulate Stripe checkout
    setTimeout(() => {
      setIsProcessing(false);
      setIsUpgradeDialogOpen(false);
      setSelectedPlan(null);
    }, 2000);
  };

  const trialDaysLeft = profile?.trial_ends_at 
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <CardTitle className="text-base">Current Plan</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">
              {profile?.subscription_tier === 'starter' && '$99'}
              {profile?.subscription_tier === 'professional' && '$299'}
              {profile?.subscription_tier === 'enterprise' && '$799'}
              {!profile?.subscription_tier && '$0'}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
          
          {profile?.subscription_status === 'trialing' && (
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
              <p className="text-sm text-violet-800">
                <strong>{trialDaysLeft} days left</strong> in your free trial. 
                Upgrade before {profile?.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleDateString() : 'trial ends'} to keep Mila active.
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsUpgradeDialogOpen(true)}>
              {profile?.subscription_status === 'trialing' ? 'Upgrade now' : 'Change plan'}
            </Button>
            {profile?.subscription_status === 'active' && (
              <Button variant="outline">
                Cancel subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.subscription_status === 'active' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gradient-to-r from-gray-700 to-gray-900 rounded flex items-center justify-center">
                  <span className="text-xs text-white font-medium">VISA</span>
                </div>
                <div>
                  <p className="font-medium">•••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                No payment method on file
              </p>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => setIsUpgradeDialogOpen(true)}
              >
                Add payment method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No invoices yet
            </p>
            {profile?.subscription_status === 'trialing' && (
              <p className="text-xs text-muted-foreground mt-1">
                Invoices will appear here after your first payment
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose your plan</DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? 'border-foreground bg-secondary/50'
                    : plan.popular
                    ? 'border-mila-violet'
                    : 'border-border hover:border-foreground/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-mila-violet text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-3xl font-semibold">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline"
              onClick={() => {
                setIsUpgradeDialogOpen(false);
                setSelectedPlan(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedPlan || isProcessing}
              onClick={handleUpgrade}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue to checkout'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
