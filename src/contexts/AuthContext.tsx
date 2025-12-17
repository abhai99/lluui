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
    // Effect 1: Listen for Firebase Auth User state changes
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      if (!u) {
        setSubscription({ isSubscribed: false, plan: null, expiresAt: null });
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Effect 2: Listen for Firestore Profile changes (Only when user is logged in)
    let unsubscribeProfile = () => { };
    let isProcessingLogout = false;

    const setupProfileListener = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const userDocRef = doc(db, "users", user.uid);

        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          // If we are already logging out, ignore further updates
          if (isProcessingLogout) return;

          if (docSnap.exists()) {
            const data = docSnap.data();

            // 1. Security Check
            const remoteDeviceId = data.deviceId;
            const localDeviceId = localStorage.getItem('deviceId');

            if (remoteDeviceId && localDeviceId && remoteDeviceId !== localDeviceId) {
              isProcessingLogout = true; // Lock
              console.warn("Session invalidated.");

              // Stop listening immediately
              unsubscribeProfile();

              alert("Logged in on another device. Logging out...");

              logOut().then(() => {
                setUser(null);
                // Redirect to Home immediately to clear state/view
                window.location.href = '/';
              });
              return;
            }

            // 2. Subscription Check
            let expiresAt = null;
            const subData = data.subscription;
            if (subData?.expiresAt) {
              if (typeof subData.expiresAt === 'string') expiresAt = new Date(subData.expiresAt);
              else if (subData.expiresAt.seconds) expiresAt = new Date(subData.expiresAt.seconds * 1000);
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
          setLoading(false);
        }, (err) => {
          console.error("Snapshot error:", err);
          setLoading(false);
        });

      } catch (err) {
        console.error("Setup error:", err);
        setLoading(false);
      }
    };

    setupProfileListener();

    return () => {
      unsubscribeProfile();
    };
  }, [user]);

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
