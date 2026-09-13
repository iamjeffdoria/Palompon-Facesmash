import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  photoURL: string | null;
  text: string;
  createdAt: number;
}
export function useLiveChat(max = 50) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("createdAt", "desc"), limit(max));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, "id">) }));
      setMessages(docs.reverse());
      setLoading(false);
    });
    return () => unsub();
  }, [max]);
  return { messages, loading };
}