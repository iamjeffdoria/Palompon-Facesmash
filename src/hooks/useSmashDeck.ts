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
  myChoice?: "smash" | "pass" | null;
}

export function useSmashDeck(myUid: string | undefined, max = 30) {
  const [photos, setPhotos] = useState<SmashPhoto[]>([]);
  const [mySwipes, setMySwipes] = useState<Record<string, "smash" | "pass">>({});
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
      setMySwipes({});
      return;
    }
    const q = query(collection(db, "smashSwipes"), where("uid", "==", myUid));
    const unsub = onSnapshot(q, (snap) => {
      const next: Record<string, "smash" | "pass"> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        next[data.photoId as string] = data.choice as "smash" | "pass";
      });
      setMySwipes(next);
    });
    return () => unsub();
  }, [myUid]);

  // Keep every photo visible — attach your swipe choice (if any) so the card
  // can show a status instead of hiding fully-swiped photos from the deck.
  const deck = photos.map((p) => ({ ...p, myChoice: mySwipes[p.id] ?? null }));

  return { deck, loading };
}