import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setSubscription, user, loading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [countdown, setCountdown] = useState(5);

    const orderId = searchParams.get('order_id');

    useEffect(() => {
        const verifyPayment = async () => {
            // 1. Wait for Auth to Initialize
            if (loading) return;

            if (!orderId) {
                setStatus('failed');
                return;
            }

            try {
                // Call our secure verification API (Point to Vercel backend)
                const response = await fetch('https://lluui.vercel.app/api/verify-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                });

                const data = await response.json();

                if (data.success && data.isPaid) {
                    setStatus('success');

                    // Activate subscription based on REAL plan from backend
                    const startDate = new Date();
                    const expiresAt = new Date();
                    // data.plan is guaranteed to be 'weekly' or 'monthly' by backend
                    if (data.plan === 'weekly') {
                        expiresAt.setDate(expiresAt.getDate() + 7);
                    } else {
                        expiresAt.setDate(expiresAt.getDate() + 30);
                    }

                    // Save to Firestore for persistent tracking
                    if (user) {
                        try {
                            console.log("Saving subscription for user:", user.uid);
                            await setDoc(doc(db, 'users', user.uid), {
                                email: user.email,
                                displayName: user.displayName || 'User',
                                subscription: {
                                    isSubscribed: true,
                                    plan: data.plan,
                                    startDate: startDate.toISOString(),
                                    expiresAt: expiresAt.toISOString(),
                                    orderId: orderId,
                                    transactionId: data.cf_payment_id || orderId, // Use Order ID if transaction ID missing
                                    amount: data.amount,
                                    currency: data.currency
                                },
                                lastUpdated: new Date().toISOString()
                            }, { merge: true });
                            console.log("Subscription saved successfully!");
                        } catch (err) {
                            console.error("Error saving to Firestore:", err);
                        }
                    } else {
                        console.error("User not found during save! Auth state:", { loading, user });
                    }

                    setSubscription({
                        isSubscribed: true,
                        plan: data.plan, // 'weekly' or 'monthly'
                        expiresAt,
                    });
                } else {
                    setStatus('failed');
                    console.error('Payment Verification Failed:', data);
                }
            } catch (error) {
                console.error('Verification Error:', error);
                setStatus('failed');
            }
        };

        verifyPayment();
    }, [orderId, setSubscription, user, loading]);

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
