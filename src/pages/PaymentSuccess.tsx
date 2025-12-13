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
    const [countdown, setCountdown] = useState(5);

    const orderId = searchParams.get('order_id');

    useEffect(() => {
        // Simulate payment verification
        const timer = setTimeout(() => {
            if (orderId) {
                setStatus('success');
                // Activate subscription
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                setSubscription({ isSubscribed: true, plan: 'monthly', expiresAt });
            } else {
                setStatus('failed');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [orderId, setSubscription]);

    // Countdown Timer
    useEffect(() => {
        if (status === 'loading') return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate('/'); // Auto redirect
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status, navigate]);

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
                                <h1 className="font-display text-2xl font-bold text-foreground mb-2">Verifying Payment...</h1>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h1 className="font-display text-2xl font-bold text-foreground mb-2">Payment Successful! 🎉</h1>
                                <p className="text-muted-foreground mb-6">Your premium subscription is now active.</p>
                                <p className="text-sm font-medium text-primary">Redirecting in {countdown}s...</p>
                            </>
                        )}

                        {status === 'failed' && (
                            <>
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <XCircle className="w-12 h-12 text-destructive" />
                                </div>
                                <h1 className="font-display text-2xl font-bold text-foreground mb-2">Payment Cancelled</h1>
                                <p className="text-muted-foreground mb-6">You cancelled the payment process.</p>
                                <p className="text-sm font-medium text-primary">Redirecting in {countdown}s...</p>
                            </>
                        )}

                        <div className="mt-6">
                            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                                Go Home Now
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentSuccess;
