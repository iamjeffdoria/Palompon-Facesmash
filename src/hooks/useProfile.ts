import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserProfile {
  firstName: string;
  lastName: string;
  photoURL?: string;
}

export function useProfile(
  uid: string | undefined,
  fallbackName: string | null,
  fallbackPhotoURL: string | null = null
) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (data?.firstName) {
        setProfile({
          firstName: data.firstName,
          lastName: data.lastName ?? "",
          photoURL: data.photoURL ?? undefined,
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  async function updateProfile(firstName: string, lastName: string, photoURL?: string) {
    if (!uid) return;
    const payload: Record<string, string> = { firstName, lastName };
    if (photoURL) payload.photoURL = photoURL;
    await setDoc(doc(db, "users", uid), payload, { merge: true });
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : fallbackName ?? "Someone";

  const displayPhotoURL = profile?.photoURL || fallbackPhotoURL;

  return { profile, displayName, displayPhotoURL, loading, updateName: updateProfile };
}