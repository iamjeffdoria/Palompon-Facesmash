import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface AppNotification {
  id: string;
  recipientUid: string;
  actorUid: string;
  actorName: string;
  actorPhotoURL: string | null;
  type: "vote" | "smash";
  contextId: string;
  read: boolean;
  createdAt: number;
}

export function useNotifications(uid: string | undefined, max = 20) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, "id">) })));
      setLoading(false);
    });
    return () => unsub();
  }, [uid, max]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading };
}