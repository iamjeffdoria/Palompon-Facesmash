import { addDoc, collection, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import type { AppNotification } from "../hooks/useNotifications";

interface CreateNotificationInput {
  recipientUid: string;
  actorUid: string;
  actorName: string;
  actorPhotoURL: string | null;
  type: "vote" | "smash";
  contextId: string;
}

export async function createNotification(input: CreateNotificationInput) {
  if (input.recipientUid === input.actorUid) return; // never notify yourself
  await addDoc(collection(db, "notifications"), {
    ...input,
    read: false,
    createdAt: Date.now(),
  });
}

export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}

export async function markAllNotificationsRead(notifs: AppNotification[]) {
  const unread = notifs.filter((n) => !n.read);
  if (unread.length === 0) return;
  const batch = writeBatch(db);
  unread.forEach((n) => batch.update(doc(db, "notifications", n.id), { read: true }));
  await batch.commit();
}