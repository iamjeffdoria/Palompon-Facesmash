import { useEffect, useState } from "react";
import { collection, collectionGroup, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function useLiveStats() {
  const [matchVotesToday, setMatchVotesToday] = useState(0);
  const [smashVotesToday, setSmashVotesToday] = useState(0);
  const [barangaySet, setBarangaySet] = useState<Set<string>>(new Set());
  const [uidSet, setUidSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = startOfTodayMs();

    const votersQ = query(collectionGroup(db, "voters"), orderBy("votedAt", "desc"), limit(500));
    const unsubVoters = onSnapshot(votersQ, (snap) => {
      setMatchVotesToday(snap.docs.filter((d) => (d.data().votedAt as number) >= today).length);
    });

    const swipesQ = query(collection(db, "smashSwipes"), orderBy("createdAt", "desc"), limit(500));
    const unsubSwipes = onSnapshot(swipesQ, (snap) => {
      setSmashVotesToday(snap.docs.filter((d) => (d.data().createdAt as number) >= today).length);
    });

    const photosQ = query(collection(db, "photos"), limit(500));
    const unsubPhotos = onSnapshot(photosQ, (snap) => {
      setBarangaySet((prev) => {
        const next = new Set(prev);
        snap.docs.forEach((d) => next.add(d.data().barangay as string));
        return next;
      });
      setUidSet((prev) => {
        const next = new Set(prev);
        snap.docs.forEach((d) => next.add(d.data().uid as string));
        return next;
      });
    });

    const smashPhotosQ = query(collection(db, "smashOrPass"), limit(500));
    const unsubSmashPhotos = onSnapshot(smashPhotosQ, (snap) => {
      setBarangaySet((prev) => {
        const next = new Set(prev);
        snap.docs.forEach((d) => next.add(d.data().barangay as string));
        return next;
      });
      setUidSet((prev) => {
        const next = new Set(prev);
        snap.docs.forEach((d) => next.add(d.data().uid as string));
        return next;
      });
    });

    return () => {
      unsubVoters();
      unsubSwipes();
      unsubPhotos();
      unsubSmashPhotos();
    };
  }, []);

  return {
    votesToday: matchVotesToday + smashVotesToday,
    barangaysRepping: barangaySet.size,
    facesInRunning: uidSet.size,
  };
}