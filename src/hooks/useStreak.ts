import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

// Tracks and updates a per-user daily streak. Call once per session after
// sign-in; it reads the user's last-active date, then either leaves the
// streak alone (already counted today), bumps it by one (visited exactly
// one day after their last visit), or resets it to 1 (missed a day or more,
// or this is their first-ever visit).
export function useStreak(uid: string | undefined) {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!uid) {
      setStreak(null);
      return;
    }
    const currentUid = uid; // capture as a definite string so TS narrows it inside the nested async function below
    let cancelled = false;

    async function updateStreak() {
      const ref = doc(db, "users", currentUid);
      const snap = await getDoc(ref);
      const today = todayKey();

      if (!snap.exists()) {
        await setDoc(ref, { streak: 1, lastActiveDate: today });
        if (!cancelled) setStreak(1);
        return;
      }

      const data = snap.data();
      const lastActiveDate = data.lastActiveDate as string | undefined;
      const currentStreak = (data.streak as number | undefined) ?? 0;

      if (lastActiveDate === today) {
        // Already counted today — just reflect the existing streak.
        if (!cancelled) setStreak(currentStreak);
        return;
      }

      const gap = lastActiveDate ? daysBetween(lastActiveDate, today) : Infinity;
      const nextStreak = gap === 1 ? currentStreak + 1 : 1;

      await setDoc(ref, { streak: nextStreak, lastActiveDate: today }, { merge: true });
      if (!cancelled) setStreak(nextStreak);
    }

    updateStreak().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return streak;
}