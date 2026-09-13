import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
interface ChatSender {
  uid: string;
  name: string;
  photoURL: string | null;
}
const MAX_MESSAGE_LENGTH = 300;
export async function sendChatMessage(sender: ChatSender, text: string) {
  const trimmed = text.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return;
  await addDoc(collection(db, "chatMessages"), {
    uid: sender.uid,
    name: sender.name,
    photoURL: sender.photoURL,
    text: trimmed,
    createdAt: Date.now(),
  });
}