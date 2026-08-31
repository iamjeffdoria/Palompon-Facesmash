import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface ProfileSummary {
  uid: string;
  name: string;
  barangay: string;
  photoURL: string;
  totalVotes: number;
  createdAt: number;
}

export function useFeaturedAndNewest() {
  const [profiles, setProfiles] = useState<Record<string, ProfileSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const photosQ = query(collection(db, "photos"), orderBy("createdAt", "desc"), limit(50));
    const unsubPhotos = onSnapshot(photosQ, (snap) => {
      setProfiles((prev) => {
        const next = { ...prev };
        snap.docs.forEach((d) => {
          const data = d.data();
          const existing = next[data.uid];
          next[data.uid] = {
            uid: data.uid,
            name: data.name,
            barangay: data.barangay,
            photoURL: data.photoURL,
            totalVotes: existing?.totalVotes ?? 0,
            createdAt: data.createdAt,
          };
        });
        return next;
      });
      setLoading(false);
    });

    const matchesQ = query(collection(db, "matches"), orderBy("createdAt", "desc"), limit(50));
    const unsubMatches = onSnapshot(matchesQ, (snap) => {
      const tally: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const votes = (d.data().votes ?? {}) as Record<string, number>;
        Object.entries(votes).forEach(([uid, count]) => {
          tally[uid] = (tally[uid] ?? 0) + count;
        });
      });
      setProfiles((prev) => {
        const next = { ...prev };
        Object.entries(tally).forEach(([uid, total]) => {
          if (next[uid]) next[uid] = { ...next[uid], totalVotes: total };
        });
        return next;
      });
    });

    return () => {
      unsubPhotos();
      unsubMatches();
    };
  }, []);

  const all = Object.values(profiles);
  const featured = all.length > 0 ? [...all].sort((a, b) => b.totalVotes - a.totalVotes)[0] : null;
  const newest = [...all].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return { featured, newest, loading };
}