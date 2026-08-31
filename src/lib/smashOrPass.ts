import { doc, increment, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

export async function castSmashVote(photoId: string, uid: string, choice: "smash" | "pass") {
  const swipeRef = doc(db, "smashSwipes", `${uid}_${photoId}`);
  const photoRef = doc(db, "smashOrPass", photoId);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(swipeRef);
    if (existing.exists()) return; // already swiped this one, no-op

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
}