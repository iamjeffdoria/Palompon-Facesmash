import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    let timeoutId: ReturnType<typeof setTimeout>;
    const popupPromise = signInWithPopup(auth, googleProvider);
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Sign-in timed out. Please try again.")),
        15000
      );
    });
    try {
      await Promise.race([popupPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }
  }

  async function logOut() {
    await signOut(auth);
  }

  return { user, loading, signInWithGoogle, logOut };
}