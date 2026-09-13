import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useReferralCount(uid: string | undefined) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!uid) {
      setCount(0);
      return;
    }
    const q = query(collection(db, "referrals"), where("referrerUid", "==", uid));
    const unsub = onSnapshot(q, (snap) => setCount(snap.size));
    return () => unsub();
  }, [uid]);
  return count;
}