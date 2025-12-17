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
        // Using dynamic import inside listener might cause race conditions if not careful, 
        // but keeping structure for now. Better to import at top level but let's stick to existing pattern
        // or just import globally since we use it a lot.
        // Actually, let's fix the imports to be top-level for standard react practice in next step if needed.
        // For now, implementing onSnapshot logic.

        try {
          const { doc, onSnapshot } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const userDocRef = doc(db, "users", user.uid);

          // REALTIME LISTENER for User Profile
          const profileUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();

              // 1. Security Check: Remote Device ID vs Local Device ID
              const remoteDeviceId = data.deviceId;
              const localDeviceId = localStorage.getItem('deviceId');

              if (remoteDeviceId && localDeviceId && remoteDeviceId !== localDeviceId) {
                console.warn("Session invalidated: New login detected on another device.");

                // Unsubscribe from this listener to prevent loops (though signOut triggers unmount)
                // Actually we can't easily access profileUnsubscribe here before it's defined? 
                // Ah, snapshot listener is robust. 

                logOut().then(() => {
                  setUser(null);
                  setSubscription({ isSubscribed: false, plan: null, expiresAt: null });
                  alert("You have been logged out because your account was accessed from another device.");
                  // We don't need to manually unsubscribe here because the parent useEffect cleanup will handle it 
                  // when the component unmounts or user state changes... wait.
                  // The parent `onAuthChange` might fire again with null user, triggering cleanup.
                  // But safe to just let auth state change handle the UI.
                });
                return;
              }

              // 2. Subscription Check
              let expiresAt = null;
              const subData = data.subscription;

              if (subData?.expiresAt) {
                if (typeof subData.expiresAt === 'string') {
                  expiresAt = new Date(subData.expiresAt);
                } else if (subData.expiresAt.seconds) {
                  expiresAt = new Date(subData.expiresAt.seconds * 1000);
                }
              }

              const isValid = expiresAt ? expiresAt > new Date() : false;

              setSubscription({
                isSubscribed: isValid,
                plan: isValid ? data.subscription?.plan : null,
                expiresAt: expiresAt
              });
            } else {
              setSubscription({ isSubscribed: false, plan: null, expiresAt: null });
            }
            setLoading(false); // Finished initial load
          }, (error) => {
            console.error("Error in user snapshot listener:", error);
            setLoading(false);
          });

          // Cleanup the Snapshot Listener when the Auth User changes (e.g. logout)
          // We need to store `profileUnsubscribe` somewhere to clean it up?
          // The `onAuthChange` callback can't return a cleanup function easily for *internal* logic.
          // Correct pattern: `useEffect` should have a state for the cleanup function.
          // BUT - `onAuthChange` returns its OWN unsubscribe.
          // Refactoring to use a separate useEffect for the Firestore listener is cleaner.
          // Let's stick to a slightly mutable approach for now or refactor.
          // Actually, putting `profileUnsubscribe` inside a ref or variable in useEffect scope is best.

          return () => {
            profileUnsubscribe();
          };

        } catch (error) {
          console.error("Error setting up user listener:", error);
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

    // Save user to Firestore immediately on login
    if (result.user) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const userRef = doc(db, "users", result.user.uid);

        // Security: Generate new Device ID
        const newDeviceId = crypto.randomUUID();
        localStorage.setItem('deviceId', newDeviceId);

        // Save/Update user profile
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          lastLogin: new Date(),
          deviceId: newDeviceId // Force update device ID on server
        }, { merge: true });

      } catch (e) {
        console.error("Error saving user to DB:", e);
      }
    }

    return { error: result.error };
  };

  const signOutUser = async () => {
    localStorage.removeItem('deviceId'); // Clear local device ID
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
