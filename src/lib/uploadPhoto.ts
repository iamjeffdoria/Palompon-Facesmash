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

async function uploadToCloudinary(file: File): Promise<string> {
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

async function pickRandomBot(excludeUid?: string) {
  const botsSnap = await getDocs(collection(db, "bots"));
  const bots = botsSnap.docs.filter((d) => d.id !== excludeUid);
  if (bots.length === 0) return null;
  const pick = bots[Math.floor(Math.random() * bots.length)];
  return { uid: pick.id, ...pick.data() } as {
    uid: string;
    name: string;
    barangay: string;
    photoURL: string;
  };
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

    const waitingQuery = query(
      collection(db, "photos"),
      where("status", "==", "waiting"),
      where("uid", "!=", user.uid),
      orderBy("uid"),
      orderBy("createdAt"),
      limit(1)
    );
    const waitingSnap = await getDocs(waitingQuery);

    const matchRef = doc(collection(db, "matches"));
    const now = Date.now();
    const VOTING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours — change here to adjust globally

    if (!waitingSnap.empty) {
      const opponentDoc = waitingSnap.docs[0];
      const opponent = opponentDoc.data();

      await runTransaction(db, async (tx) => {
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
    } else {
      const bot = await pickRandomBot(user.uid);
      if (bot) {
        await runTransaction(db, async (tx) => {
          tx.set(matchRef, {
            isBot: true,
            createdAt: now,
            closesAt: now + VOTING_WINDOW_MS,
            sides: {
              [myPhoto.uid]: myPhoto,
              [bot.uid]: bot,
            },
            votes: { [myPhoto.uid]: 0, [bot.uid]: 0 },
          });
          tx.update(photoRef, { status: "matched", matchId: matchRef.id });
        });
      }
    }

    return { photoId: photoRef.id };
  }

  return { photoId: null };
}