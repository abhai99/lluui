import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLg61i0XkPaf9cEp34mK82BJfFKQK1wbk",
  authDomain: "chat-b81d7.firebaseapp.com",
  databaseURL: "https://chat-b81d7.firebaseio.com",
  projectId: "chat-b81d7",
  storageBucket: "chat-b81d7.firebasestorage.app",
  messagingSenderId: "1071923503749",
  appId: "1:1071923503749:web:6457ec3565cf8f07af3fec"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export type { User };
