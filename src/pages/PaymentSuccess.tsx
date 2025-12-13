import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setSubscription } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

    const orderId = searchParams.get('order_id');

    useEffect(() => {
        // Simulate payment verification
        // In production, verify with backend
        const timer = setTimeout(() => {
            if (orderId) {
                setStatus('success');

                // Activate subscription
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30); // Default to monthly

                setSubscription({
                    isSubscribed: true,
                    plan: 'monthly',
                    expiresAt,
                });
            } else {
                setStatus('failed');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [orderId, setSubscription]);

    return (
        <div className="min-h-screen gradient-hero">
            <Navbar />

            <main className="pt-32 pb-12 px-4">
                <div className="container mx-auto max-w-md">
                    <div className="bg-card rounded-2xl border border-border shadow-elevated p-8 text-center animate-fade-in">
                        {status === 'loading' && (
                            <>
                                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                </div>
                                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                                    Verifying Payment...
                                </h1>
                                <p className="text-muted-foreground">
                                    Please wait while we confirm your payment.
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                                    Payment Successful! 🎉
                                </h1>
                                <p className="text-muted-foreground mb-6">
                                    Your premium subscription is now active.
                                </p>
                                {orderId && (
                                    <p className="text-xs text-muted-foreground mb-6">
                                        Order ID: {orderId}
                                    </p>
                                )}
                                <Button
                                    variant="premium"
                                    size="lg"
                                    onClick={() => navigate('/premium')}
                                    className="w-full"
                                >
                                    Access Premium Content
                                </Button>
                            </>
                        )}

                        {status === 'failed' && (
                            <>
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <XCircle className="w-12 h-12 text-destructive" />
                                </div>
                                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                                    Payment Failed
                                </h1>
                                <p className="text-muted-foreground mb-6">
                                    Something went wrong with your payment. Please try again.
                                </p>
                                <Button
                                    variant="default"
                                    size="lg"
                                    onClick={() => navigate('/')}
                                    className="w-full"
                                >
                                    Go Back Home
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentSuccess;
