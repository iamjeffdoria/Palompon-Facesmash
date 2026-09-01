import { doc, increment, runTransaction } from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notifications";

interface VoterInfo {
  name: string;
  photoURL: string | null;
}

export async function castVote(
  matchId: string,
  voterUid: string,
  votedForUid: string,
  voter: VoterInfo
) {
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

  createNotification({
    recipientUid: votedForUid,
    actorUid: voterUid,
    actorName: voter.name,
    actorPhotoURL: voter.photoURL,
    type: "vote",
    contextId: matchId,
  }).catch(console.error);
}