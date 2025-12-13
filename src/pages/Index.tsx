import { Navbar } from '@/components/Navbar';
import { PricingCard } from '@/components/PricingCard';
import { FeatureCard } from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Crown,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Index = () => {
  const { user, signIn, subscription } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get instant access to premium predictions and insights with real-time updates.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and encryption.'
    },
    {
      icon: TrendingUp,
      title: 'Accurate Predictions',
      description: 'Access our AI-powered prediction engine with 95%+ accuracy rate.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you whenever you need.'
    },
    {
      icon: Users,
      title: 'Active Community',
      description: 'Join thousands of premium members sharing insights and strategies.'
    },
    {
      icon: Star,
      title: 'Exclusive Content',
      description: 'Get access to premium content not available to free users.'
    }
  ];

  const weeklyFeatures = [
    'All premium predictions',
    '7-day access',
    'Basic support',
    'Community access'
  ];

  const monthlyFeatures = [
    'All premium predictions',
    '30-day access',
    'Priority support',
    'VIP community access',
    'Exclusive insights',
    'Early access to new features'
  ];

  // CMS State
  const [pages, setPages] = useState<{ [key: string]: { title: string, content: string } }>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'content', 'pages');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPages(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 gradient-accent px-4 py-2 rounded-full text-accent-foreground text-sm font-semibold mb-6 shadow-gold">
            <Crown className="w-4 h-4" />
            Premium Predictions Platform
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Unlock Your Winning
            <span className="text-gradient-primary"> Potential</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of winners who trust WingoBoss for accurate predictions and exclusive insights. Start winning today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              subscription.isSubscribed ? (
                <Button variant="premium" size="lg">
                  Access Premium Content
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button variant="premium" size="lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                  Get Premium Access
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )
            ) : (
              <Button variant="google" size="lg" onClick={signIn}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient-primary">WingoBoss</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our premium features designed to maximize your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CMS Content Buttons Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12">
            Exclusive <span className="text-gradient-primary">Resources</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((num) => {
              const key = `page${num}`;
              const pageData = pages[key as keyof typeof pages];
              // Logic: If title exists AND content exists -> Active. Else -> Coming Soon.
              const isActive = pageData?.title && pageData?.content;
              const title = pageData?.title || 'Coming Soon';

              return (
                <div key={num} className="animate-fade-in">
                  <Button
                    variant={isActive ? "default" : "secondary"}
                    className={`w-full h-24 text-lg font-bold shadow-lg transition-all hover:scale-105 ${isActive ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90' : 'opacity-80'
                      }`}
                    onClick={() => {
                      if (isActive) {
                        window.open(`/content/${num}`, '_self'); // Or navigate using hook
                      } else {
                        // Using standard alert or toast if available in scope, assuming toast imported or just alert for now to be safe,
                        // actually we can use the Sonner toast we have in App
                        // check imports... I will add imports in a sec.
                        alert('Coming Soon! Stay tuned.');
                      }
                    }}
                  >
                    {isActive ? (
                      <div className="flex flex-col items-center gap-1">
                        <span>{title}</span>
                        <span className="text-xs font-normal opacity-80">Click to Access</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-muted-foreground">{title}</span>
                        <span className="text-xs font-normal opacity-50">Coming Soon</span>
                      </div>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent <span className="text-gradient-accent">Pricing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              plan="weekly"
              price={99}
              features={weeklyFeatures}
            />
            <PricingCard
              plan="monthly"
              price={299}
              features={monthlyFeatures}
              popular
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="gradient-premium rounded-3xl p-12 text-center shadow-elevated">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Winning?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of winners and get access to premium predictions today.
            </p>
            <Button variant="premium" size="lg" onClick={() => !user ? signIn() : document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              {user ? 'Get Premium Now' : 'Sign Up & Get Started'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 WingoBoss. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
