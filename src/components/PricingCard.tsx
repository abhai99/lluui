import { useState, useEffect } from 'react';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { initiateCashfreePayment } from '@/lib/cashfree';

interface PricingCardProps {
  plan: 'weekly' | 'monthly';
  price: number;
  features: string[];
  popular?: boolean;
}

export const PricingCard = ({ plan, price, features, popular }: PricingCardProps) => {
  const { user, signIn, subscription, setSubscription } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state when component mounts (fixes stuck loading state on back navigation)
  useEffect(() => {
    setIsProcessing(false);
  }, []);

  const isCurrentPlan = subscription?.plan === plan && subscription?.isSubscribed;

  const handleSubscribe = async () => {
    if (isCurrentPlan) return;

    if (!user) {
      const result = await signIn();
      if (result.error) {
        toast.error('Failed to sign in. Please try again.');
        return;
      }
    }

    // Re-check user after sign in
    if (!user) {
      toast.error('Please sign in to continue.');
      return;
    }

    setIsProcessing(true);

    try {
      await initiateCashfreePayment(
        plan,
        user.displayName || 'Customer',
        user.email || '',
        // On Success
        (orderId, subscribedPlan) => {
          setIsProcessing(false);

          // Calculate expiration date
          const expiresAt = new Date();
          if (subscribedPlan === 'weekly') {
            expiresAt.setDate(expiresAt.getDate() + 7);
          } else {
            expiresAt.setDate(expiresAt.getDate() + 30);
          }

          // Update subscription status
          setSubscription({
            isSubscribed: true,
            plan: subscribedPlan,
            expiresAt,
          });

          toast.success(
            `🎉 Payment successful! Your ${subscribedPlan} subscription is now active.`,
            {
              description: `Order ID: ${orderId}`,
              duration: 5000,
            }
          );
        },
        // On Failure
        (error) => {
          setIsProcessing(false);
          toast.error(error || 'Payment failed. Please try again.');
        }
      );
    } catch (error) {
      setIsProcessing(false);
      toast.error('An error occurred. Please try again.');
      console.error('Payment error:', error);
    }
  };

  return (
    <div className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${popular
      ? 'gradient-premium text-primary-foreground shadow-elevated'
      : 'bg-card border-2 border-border shadow-soft hover:shadow-elevated'
      }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="gradient-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-gold">
            <Sparkles className="w-4 h-4" />
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className={`font-display text-lg font-semibold mb-2 ${popular ? 'text-primary-foreground' : 'text-foreground'}`}>
          {plan === 'weekly' ? 'Weekly Pass' : 'Monthly Premium'}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-4xl font-display font-bold ${popular ? 'text-primary-foreground' : 'text-gradient-primary'}`}>
            ₹{price}
          </span>
          <span className={popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
            /{plan === 'weekly' ? 'week' : 'month'}
          </span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${popular ? 'bg-accent' : 'gradient-primary'
              }`}>
              <Check className={`w-3 h-3 ${popular ? 'text-accent-foreground' : 'text-primary-foreground'}`} />
            </div>
            <span className={popular ? 'text-primary-foreground/90' : 'text-muted-foreground'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={popular ? 'premium' : 'default'}
        size="lg"
        className="w-full"
        onClick={handleSubscribe}
        disabled={isProcessing || isCurrentPlan}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : user ? (
          'Subscribe Now'
        ) : (
          'Sign in to Subscribe'
        )}
      </Button>
    </div>
  );
};
