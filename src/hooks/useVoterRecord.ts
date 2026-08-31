import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useVoterRecord(matchId: string | undefined, uid: string | undefined) {
  const [votedFor, setVotedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId || !uid) {
      setVotedFor(null);
      return;
    }
    const ref = doc(db, "matches", matchId, "voters", uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setVotedFor(data ? (data.votedFor as string) : null);
    });
    return () => unsub();
  }, [matchId, uid]);

  return votedFor;
}