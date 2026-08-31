import { doc, increment, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

export async function castVote(matchId: string, voterUid: string, votedForUid: string) {
  const voterRef = doc(db, "matches", matchId, "voters", voterUid);
  const matchRef = doc(db, "matches", matchId);

  await runTransaction(db, async (tx) => {
    const voterSnap = await tx.get(voterRef);
    if (voterSnap.exists()) {
      throw new Error("already-voted");
    }
    tx.set(voterRef, { votedFor: votedForUid, votedAt: Date.now() });
    tx.update(matchRef, { [`votes.${votedForUid}`]: increment(1) });
  });
}