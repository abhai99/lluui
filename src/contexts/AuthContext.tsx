import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthChange, signInWithGoogle, logOut } from '@/lib/firebase';

interface Subscription {
  isSubscribed: boolean;
  plan: 'weekly' | 'monthly' | null;
  expiresAt: Date | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: Subscription;
  isAdmin: boolean;
  signIn: () => Promise<{ error: string | null }>;
  signOutUser: () => Promise<{ error: string | null }>;
  setSubscription: (sub: Subscription) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin emails - in production, this should come from your database
const ADMIN_EMAILS = ['ariffkhan919@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription>({
    isSubscribed: false,
    plan: null,
    expiresAt: null,
  });

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);

      if (user) {
        setLoading(true);
        try {
          // Fetch real subscription data from Firestore
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');

          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            // Check if expiry date is valid
            const expiresAt = data.subscription?.expiresAt ? new Date(data.subscription.expiresAt.seconds * 1000) : null;
            const isValid = expiresAt ? expiresAt > new Date() : false;

            setSubscription({
              isSubscribed: isValid,
              plan: isValid ? data.subscription?.plan : null,
              expiresAt: expiresAt
            });
          } else {
            setSubscription({ isSubscribed: false, plan: null, expiresAt: null });
          }
        } catch (error) {
          console.error("Error fetching user subscription:", error);
          setSubscription({ isSubscribed: false, plan: null, expiresAt: null });
        } finally {
          setLoading(false);
        }
      } else {
        setSubscription({ isSubscribed: false, plan: null, expiresAt: null });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const result = await signInWithGoogle();
    return { error: result.error };
  };

  const signOutUser = async () => {
    const result = await logOut();
    if (!result.error) {
      setSubscription({ isSubscribed: false, plan: null, expiresAt: null });
    }
    return { error: result.error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      subscription,
      isAdmin,
      signIn,
      signOutUser,
      setSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
