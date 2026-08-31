import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface MatchSide {
  uid: string;
  name: string;
  barangay: string;
  photoURL: string;
}

export interface MatchData {
  id: string;
  sides: Record<string, MatchSide>;
  votes: Record<string, number>;
  isBot: boolean;
  createdAt: number;
  closesAt: number;
}

export function useLatestMatch() {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setMatch(null);
      } else {
        const d = snap.docs[0];
        setMatch({ id: d.id, ...(d.data() as Omit<MatchData, "id">) });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { match, loading };
}