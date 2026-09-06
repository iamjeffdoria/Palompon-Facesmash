import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserProfile {
  firstName: string;
  lastName: string;
}

export function useProfile(uid: string | undefined, fallbackName: string | null) {
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
        setProfile({ firstName: data.firstName, lastName: data.lastName ?? "" });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  async function updateName(firstName: string, lastName: string) {
    if (!uid) return;
    await setDoc(doc(db, "users", uid), { firstName, lastName }, { merge: true });
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : fallbackName ?? "Someone";

  return { profile, displayName, loading, updateName };
}