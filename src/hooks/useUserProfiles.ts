import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface LiveProfile {
  name: string;
  photoURL: string | null;
}

export function useUserProfiles(uids: string[]) {
  const [profiles, setProfiles] = useState<Record<string, LiveProfile>>({});
  const uidsKey = [...new Set(uids)].filter(Boolean).sort().join(",");

  useEffect(() => {
    const uniqueUids = uidsKey ? uidsKey.split(",") : [];
    if (uniqueUids.length === 0) return;
    const unsubs = uniqueUids.map((uid) =>
      onSnapshot(doc(db, "users", uid), (snap) => {
        const data = snap.data();
        if (data?.firstName) {
          setProfiles((prev) => ({
            ...prev,
            [uid]: {
              name: `${data.firstName} ${data.lastName ?? ""}`.trim(),
              photoURL: data.photoURL ?? null,
            },
          }));
        }
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [uidsKey]);

  return profiles;
}