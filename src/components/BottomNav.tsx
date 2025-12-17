import { Home, Crown, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export const BottomNav = () => {
    const { user, isAdmin, signIn } = useAuth();
    const location = useLocation();

    // Hide BottomNav on specific pages (e.g. Mobile Login Flow)
    if (['/app-success', '/mobile-login'].includes(location.pathname)) {
        return null;
    }

    // Only show on mobile
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">

                <Link to="/" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Home className={`w-6 h-6 ${location.pathname === '/' ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link to="/premium" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${location.pathname === '/premium' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Crown className={`w-6 h-6 ${location.pathname === '/premium' ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-medium">Premium</span>
                </Link>

                {isAdmin && (
                    <Link to="/admin" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <Settings className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Admin</span>
                    </Link>
                )}

                <div
                    onClick={() => {
                        if (!user) {
                            // Mobile Deep Link Check
                            if (/Android/i.test(navigator.userAgent)) {
                                window.location.href = "myapp://native-login";
                            } else {
                                signIn();
                            }
                        }
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${user ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    {user?.photoURL ? (
                        <img src={user.photoURL} className="w-6 h-6 rounded-full border border-current" alt="Profile" />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                    <span className="text-[10px] font-medium">{user ? 'Me' : 'Login'}</span>
                </div>

            </div>
        </div>
    );
};
