import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

interface UserInfo {
  uid: string;
  displayName: string | null;
}

type UploadDestination = "match" | "smash" | "both";

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url as string;
}



export async function uploadPhotoAndQueue(
  file: File,
  user: UserInfo,
  destination: UploadDestination,
  barangay: string
) {
  const photoURL = await uploadToCloudinary(file);

  const myPhoto = {
    uid: user.uid,
    name: user.displayName ?? "Anonymous",
    barangay,
    photoURL,
  };

  // Smash or Pass pool — independent of the match queue.
  if (destination === "smash" || destination === "both") {
    await addDoc(collection(db, "smashOrPass"), {
      ...myPhoto,
      smashCount: 0,
      passCount: 0,
      createdAt: Date.now(),
    });
  }

  // Match Card queue — only enter this if the user actually wants a VS matchup.
  if (destination === "match" || destination === "both") {
    const photoRef = await addDoc(collection(db, "photos"), {
      ...myPhoto,
      status: "waiting",
      matchId: null,
      createdAt: Date.now(),
    });

    // Everything below is best-effort matchmaking. The photo above is
    // already saved and "waiting" — if anything in this block throws
    // (e.g. a missing Firestore index, a transient permissions hiccup),
    // we log it and move on rather than surfacing "Upload didn't go
    // through" for a post that actually succeeded.
    try {
      // Fetch the longest-waiting photos in true FIFO order (single equality
      // filter only, so createdAt ordering isn't distorted by an inequality
      // filter on uid). Filter out our own upload client-side, then try each
      // candidate in turn until one successfully pairs.
      const waitingQuery = query(
        collection(db, "photos"),
        where("status", "==", "waiting"),
        orderBy("createdAt", "asc"),
        limit(5)
      );
      const waitingSnap = await getDocs(waitingQuery);
      const candidates = waitingSnap.docs.filter(
        (d) => d.id !== photoRef.id && d.data().uid !== user.uid
      );

      const now = Date.now();
      const VOTING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours — change here to adjust globally

      for (const opponentDoc of candidates) {
        const matchRef = doc(collection(db, "matches"));
        try {
          await runTransaction(db, async (tx) => {
            // Re-read both docs inside the transaction to guard against a
            // race where another upload claims this same opponent (or us)
            // between our query above and this write.
            const freshOpponent = await tx.get(opponentDoc.ref);
            const opponent = freshOpponent.data();
            if (!opponent || opponent.status !== "waiting") {
              throw new Error("opponent-already-matched");
            }
            const freshPhoto = await tx.get(photoRef);
            const myPhotoData = freshPhoto.data();
            if (!myPhotoData || myPhotoData.status !== "waiting") {
              throw new Error("self-already-matched");
            }

            tx.set(matchRef, {
              isBot: false,
              createdAt: now,
              closesAt: now + VOTING_WINDOW_MS,
              sides: {
                [myPhoto.uid]: myPhoto,
                [opponent.uid]: {
                  uid: opponent.uid,
                  name: opponent.name,
                  barangay: opponent.barangay,
                  photoURL: opponent.photoURL,
                },
              },
              votes: { [myPhoto.uid]: 0, [opponent.uid]: 0 },
            });
            tx.update(opponentDoc.ref, { status: "matched", matchId: matchRef.id });
            tx.update(photoRef, { status: "matched", matchId: matchRef.id });
          });
          break; // matched successfully — stop trying further candidates
        } catch (err) {
          if (err instanceof Error && err.message === "self-already-matched") break;
          if (err instanceof Error && err.message === "opponent-already-matched") continue;
          // Anything else (permission-denied, failed-precondition from a
          // missing index, etc.) is a real failure worth logging clearly,
          // but shouldn't stop us from returning success below.
          console.error("Matchmaking failed for candidate", opponentDoc.id, err);
          throw err;
        }
      }
      // If no candidate was available (or all got claimed first), the photo
      // stays "waiting". MatchFoundModal listens via onSnapshot and will
      // flip to "matched" automatically once the next uploader's pass pairs us.
    } catch (err) {
      console.error("Matchmaking failed, photo still posted as waiting:", err);
    }

    return { photoId: photoRef.id };
  }

  return { photoId: null };
}