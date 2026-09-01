import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface MostSmashed {
  id: string;
  uid: string;
  name: string;
  barangay: string;
  photoURL: string;
  smashCount: number;
}

export function useMostSmashed(top = 5) {
  const [standings, setStandings] = useState<MostSmashed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firestore can't combine orderBy on a field with equality filters across
    // unrelated docs here, so pull a reasonable window sorted by smashCount directly.
    const q = query(collection(db, "smashOrPass"), orderBy("smashCount", "desc"), limit(top));
    const unsub = onSnapshot(q, (snap) => {
      setStandings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MostSmashed, "id">) })));
      setLoading(false);
    });
    return () => unsub();
  }, [top]);

  return { standings, loading };
}