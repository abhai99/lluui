import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, LogOut, Menu, X, Settings } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, signIn, signOutUser, subscription, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    signIn();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">WingoBoss</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {subscription.isSubscribed && (
                  <Link to="/premium" className="text-muted-foreground hover:text-foreground transition-colors">
                    Premium
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-primary/30"
                  />
                  <span className="text-sm font-medium text-foreground">{user.displayName}</span>
                </div>
                <Button variant="outline" size="sm" onClick={signOutUser}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={handleLogin}>
                Sign in with Google
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-primary/30"
                  />
                  <div>
                    <p className="font-medium text-foreground">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {subscription.isSubscribed && (
                  <Link
                    to="/premium"
                    className="block px-2 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Premium Content
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-2 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Button variant="outline" className="w-full" onClick={signOutUser}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="default" className="w-full" onClick={handleLogin}>
                Sign in with Google
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
