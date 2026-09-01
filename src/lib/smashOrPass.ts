import { doc, increment, runTransaction } from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notifications";

interface VoterInfo {
  name: string;
  photoURL: string | null;
}

export async function castSmashVote(
  photoId: string,
  uid: string,
  choice: "smash" | "pass",
  photoOwnerUid: string,
  voter: VoterInfo
) {
  const swipeRef = doc(db, "smashSwipes", `${uid}_${photoId}`);
  const photoRef = doc(db, "smashOrPass", photoId);

  let alreadySwiped = false;

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(swipeRef);
    if (existing.exists()) {
      alreadySwiped = true;
      return; // already swiped this one, no-op
    }

    tx.set(swipeRef, {
      uid,
      photoId,
      choice,
      createdAt: Date.now(),
    });
    tx.update(photoRef, {
      [choice === "smash" ? "smashCount" : "passCount"]: increment(1),
    });
  });

  if (!alreadySwiped && choice === "smash") {
    createNotification({
      recipientUid: photoOwnerUid,
      actorUid: uid,
      actorName: voter.name,
      actorPhotoURL: voter.photoURL,
      type: "smash",
      contextId: photoId,
    }).catch(console.error);
  }
}