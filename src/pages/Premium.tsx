import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Crown, Star, TrendingUp, Clock, ChevronRight } from 'lucide-react';

const Premium = () => {
  const { user, subscription, loading } = useAuth();

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

  // For demo purposes, show premium content even without subscription
  // In production, uncomment below:
  // if (!subscription.isSubscribed) {
  //   return <Navigate to="/" replace />;
  // }

  const premiumPages = [
    {
      title: 'Today\'s Predictions',
      description: 'Get accurate predictions for today\'s games',
      icon: TrendingUp,
      href: '#'
    },
    {
      title: 'VIP Insights',
      description: 'Exclusive analysis and strategies',
      icon: Star,
      href: '#'
    },
    {
      title: 'Historical Data',
      description: 'Access past results and patterns',
      icon: Clock,
      href: '#'
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Banner */}
          <div className="gradient-premium rounded-3xl p-8 md:p-12 mb-12 shadow-elevated animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center shadow-gold">
                <Crown className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
                  Welcome back, {user.displayName?.split(' ')[0]}!
                </h1>
                <p className="text-primary-foreground/70">
                  {subscription.isSubscribed 
                    ? `${subscription.plan === 'weekly' ? 'Weekly' : 'Monthly'} Premium Member`
                    : 'Preview Mode - Subscribe for full access'}
                </p>
              </div>
            </div>
          </div>

          {/* Premium Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {premiumPages.map((page, index) => (
              <Link 
                key={index} 
                to={page.href}
                className="group p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <page.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2 flex items-center justify-between">
                  {page.title}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-muted-foreground">{page.description}</p>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Accuracy Rate', value: '95%' },
              { label: 'Active Users', value: '10K+' },
              { label: 'Daily Predictions', value: '50+' },
              { label: 'Success Stories', value: '5K+' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="p-6 rounded-2xl bg-card border border-border text-center animate-slide-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <p className="font-display text-2xl md:text-3xl font-bold text-gradient-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Premium;
