import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface BarangayStanding {
  barangay: string;
  totalVotes: number;
}

export function useBarangayStandings(matchLimit = 500) {
  const [standings, setStandings] = useState<BarangayStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"), limit(matchLimit));
    const unsub = onSnapshot(q, (snap) => {
      const tally: Record<string, number> = {};

      snap.docs.forEach((d) => {
        const data = d.data();
        const sides = data.sides as Record<string, { barangay: string }>;
        const votes = (data.votes ?? {}) as Record<string, number>;

        Object.entries(votes).forEach(([uid, count]) => {
          const barangay = sides[uid]?.barangay;
          if (!barangay) return;
          tally[barangay] = (tally[barangay] ?? 0) + count;
        });
      });

      const sorted = Object.entries(tally)
        .map(([barangay, totalVotes]) => ({ barangay, totalVotes }))
        .sort((a, b) => b.totalVotes - a.totalVotes);

      setStandings(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, [matchLimit]);

  return { standings, loading };
}