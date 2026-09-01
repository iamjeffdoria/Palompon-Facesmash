import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface IndividualStanding {
  uid: string;
  name: string;
  barangay: string;
  totalVotes: number;
}

export function useIndividualStandings(matchLimit = 500, top = 5) {
  const [standings, setStandings] = useState<IndividualStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"), limit(matchLimit));
    const unsub = onSnapshot(q, (snap) => {
      const tally: Record<string, IndividualStanding> = {};

      snap.docs.forEach((d) => {
        const data = d.data();
        const sides = data.sides as Record<string, { name: string; barangay: string }>;
        const votes = (data.votes ?? {}) as Record<string, number>;

        Object.entries(votes).forEach(([uid, count]) => {
          const side = sides[uid];
          if (!side) return;
          if (!tally[uid]) {
            tally[uid] = { uid, name: side.name, barangay: side.barangay, totalVotes: 0 };
          }
          tally[uid].totalVotes += count;
        });
      });

      const sorted = Object.values(tally)
        .sort((a, b) => b.totalVotes - a.totalVotes)
        .slice(0, top);

      setStandings(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, [matchLimit, top]);

  return { standings, loading };
}