import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyABK3hb1ucRu1jjrTu98VMiZvmbdoNYr8s",
  authDomain: "winultmate.firebaseapp.com",
  projectId: "winultmate",
  storageBucket: "winultmate.firebasestorage.app",
  messagingSenderId: "617856504132",
  appId: "1:617856504132:web:248501dbc2c2c8c2828711"
};

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getApps, getApp } from "firebase/app";

// Singleton Pattern (prevents double-init in HMR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with specific settings for reliability
// We use long-polling if websockets fail (common cause of "offline" errors)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    // The page will redirect, so we don't return anything meaningful immediately.
    // The result is handled by getRedirectResult on page load.
    return { user: null, error: null };
  } catch (error: unknown) {
    console.error("Redirect Error:", error);
    return { user: null, error: error instanceof Error ? error.message : String(error) };
  }
};

export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return { user: result?.user || null, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : String(error) };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export type { User };
