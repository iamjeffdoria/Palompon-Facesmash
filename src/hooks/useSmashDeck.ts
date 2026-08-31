import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface SmashPhoto {
  id: string;
  uid: string;
  name: string;
  barangay: string;
  photoURL: string;
  smashCount: number;
  passCount: number;
  createdAt: number;
}

export function useSmashDeck(myUid: string | undefined, max = 30) {
  const [photos, setPhotos] = useState<SmashPhoto[]>([]);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "smashOrPass"), orderBy("createdAt", "desc"), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SmashPhoto, "id">) })));
      setLoading(false);
    });
    return () => unsub();
  }, [max]);

  useEffect(() => {
    if (!myUid) {
      setSwipedIds(new Set());
      return;
    }
    const q = query(collection(db, "smashSwipes"), where("uid", "==", myUid));
    const unsub = onSnapshot(q, (snap) => {
      setSwipedIds(new Set(snap.docs.map((d) => d.data().photoId as string)));
    });
    return () => unsub();
  }, [myUid]);

  // Show your own photo too, just exclude anything you've already swiped on.
  const deck = photos.filter((p) => !swipedIds.has(p.id));

  return { deck, loading };
}