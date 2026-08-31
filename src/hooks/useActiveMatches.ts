import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { MatchData } from "./useLatestMatch";

export function useActiveMatches(max = 20) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MatchData, "id">) })));
      setLoading(false);
    });
    return () => unsub();
  }, [max]);

  return { matches, loading };
}