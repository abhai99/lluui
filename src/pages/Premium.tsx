import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Crown, Lock, ChevronRight } from 'lucide-react';
import { defaultPages } from '@/lib/defaultContent';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Premium = () => {
  const { user, subscription, loading } = useAuth();
  const [pages, setPages] = useState<{ [key: string]: { title: string, content: string } }>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const cmsDoc = await getDoc(doc(db, 'content', 'pages'));
        if (cmsDoc.exists()) {
          setPages(cmsDoc.data() as any);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Active Subscription Requirement
  const isSubscribed = subscription.isSubscribed;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />

      {/* Header / Title */}
      <div className="pt-24 px-4 mb-8 text-center">
        <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
          Premium Tools
        </h1>
        <p className="text-muted-foreground mt-2">
          {isSubscribed ? "Access your exclusive prediction tools below." : "Subscribe to unlock these powerful tools."}
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-lg">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((num) => {
            const key = `page${num}`;
            // Fallback Logic
            const cmsPage = pages[key as keyof typeof pages];
            const defPage = defaultPages[key as keyof typeof defaultPages];

            const pageData = {
              title: cmsPage?.title || defPage?.title,
              content: cmsPage?.content || defPage?.content
            };

            // Active if title AND content exist
            const isActive = !!(pageData?.title && pageData?.content);
            const title = pageData?.title || `Tool ${num}`;

            return (
              <div
                key={num}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${num * 0.1}s` }}
              >
                <div className={`
                    absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity duration-300
                    ${isSubscribed ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}
                  `}
                />

                <Button
                  variant="outline"
                  className={`
                    w-full h-20 relative overflow-hidden border-2 rounded-2xl transition-all duration-300
                    flex items-center justify-between px-6
                    ${!isSubscribed
                      ? 'border-dashed border-border opacity-70 bg-secondary/30'
                      : 'border-primary/20 bg-card hover:border-primary hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                  onClick={() => {
                    if (!isSubscribed) {
                      toast.error("Premium subscription required!");
                      // Scroll to pricing on Home? Or navigate? 
                      // Simplified: redirect to home pricing
                      window.location.href = "/#pricing";
                      return;
                    }
                    if (isActive) {
                      window.open(`/content/${num}`, '_self');
                    } else {
                      toast.info("This tool is coming soon.");
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon Box */}
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        ${isSubscribed ? 'gradient-primary text-white shadow-soft' : 'bg-muted text-muted-foreground'}
                     `}>
                      {isSubscribed ? <Crown className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>

                    {/* Text */}
                    <div className="text-left">
                      <div className={`font-bold text-lg ${isSubscribed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {title}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {isSubscribed ? (isActive ? 'Active & Ready' : 'Coming Soon') : 'Locked'}
                      </div>
                    </div>
                  </div>

                  {isSubscribed && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Lock Screen / Upsell (If not subscribed) */}
        {!isSubscribed && (
          <div className="mt-8 p-6 rounded-3xl gradient-premium text-center shadow-elevated animate-fade-in relative overflow-hidden">
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Unlock Full Access</h2>
              <p className="text-white/70 mb-6 text-sm">
                Get instant access to all premium prediction tools and win big.
              </p>
              <Button
                className="w-full bg-white text-black hover:bg-white/90 font-bold shadow-lg"
                onClick={() => window.location.href = "/#pricing"}
              >
                Upgrade Now
              </Button>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-16 -mb-16" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium;
