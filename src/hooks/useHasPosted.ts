import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useHasPosted(uid: string | undefined) {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasSmash, setHasSmash] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setHasPhoto(false);
      setHasSmash(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    let photoLoaded = false;
    let smashLoaded = false;
    function maybeDone() {
      if (photoLoaded && smashLoaded) setLoading(false);
    }
    const photosQ = query(collection(db, "photos"), where("uid", "==", uid), limit(1));
    const smashQ = query(collection(db, "smashOrPass"), where("uid", "==", uid), limit(1));
    const unsubPhotos = onSnapshot(photosQ, (snap) => {
      setHasPhoto(!snap.empty);
      photoLoaded = true;
      maybeDone();
    });
    const unsubSmash = onSnapshot(smashQ, (snap) => {
      setHasSmash(!snap.empty);
      smashLoaded = true;
      maybeDone();
    });
    return () => {
      unsubPhotos();
      unsubSmash();
    };
  }, [uid]);

  return { hasPosted: hasPhoto || hasSmash, loading };
}