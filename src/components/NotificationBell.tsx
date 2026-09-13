import { useMemo, useState } from "react";
import { Bell, Flame, Heart, X } from "lucide-react";
import { useNotifications, type AppNotification } from "../hooks/useNotifications";
import { markAllNotificationsRead, markNotificationRead } from "../lib/notifications";
import { timeAgo } from "../lib/timeAgo";
import { useUserProfiles, type LiveProfile } from "../hooks/useUserProfiles";

interface GroupedNotification {
  key: string;
  type: "vote" | "smash";
  contextId: string;
  actors: { uid: string; name: string }[];
  latestActorUid: string;
  latestActorPhotoURL: string | null;
  read: boolean;
  createdAt: number;
  ids: string[];
}
function formatActors(
  actors: { uid: string; name: string }[],
  profiles: Record<string, LiveProfile>
): string {
  const unique = [...new Map(actors.map((a) => [a.uid, a])).values()];
  const names = unique.map((a) => profiles[a.uid]?.name || a.name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]} and ${names.length - 1} others`;
}
function groupNotifications(notifications: AppNotification[]): GroupedNotification[] {
  const groups = new Map<string, GroupedNotification>();
  for (const n of notifications) {
    const key = `${n.type}:${n.contextId}`;
    const existing = groups.get(key);
    if (existing) {
      existing.actors.push({ uid: n.actorUid, name: n.actorName });
      existing.ids.push(n.id);
      existing.read = existing.read && n.read;
      if (n.createdAt > existing.createdAt) {
        existing.createdAt = n.createdAt;
        existing.latestActorUid = n.actorUid;
        existing.latestActorPhotoURL = n.actorPhotoURL;
      }
    } else {
      groups.set(key, {
        key,
        type: n.type,
        contextId: n.contextId,
        actors: [{ uid: n.actorUid, name: n.actorName }],
        latestActorUid: n.actorUid,
        latestActorPhotoURL: n.actorPhotoURL,
        read: n.read,
        createdAt: n.createdAt,
        ids: [n.id],
      });
    }
  }
  return [...groups.values()].sort((a, b) => b.createdAt - a.createdAt);
}

export default function NotificationBell({ uid }: { uid: string | undefined }) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications(uid);
  const actorUids = useMemo(() => notifications.map((n) => n.actorUid), [notifications]);
  const profiles = useUserProfiles(actorUids);
  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    // Mark read on CLOSE, not open — so the unread highlight is actually
    // visible while the person is looking at the panel, instead of being
    // flipped to read before they've had a chance to see it.
    if (!next && unreadCount > 0) {
      markAllNotificationsRead(notifications).catch(console.error);
    }
  }

  if (!uid) return null;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 hover:text-coral transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-coral text-sand text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-ink/20 z-40"
            onClick={() => {
              setOpen(false);
              if (unreadCount > 0) markAllNotificationsRead(notifications).catch(console.error);
            }}
          />
          <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-md sm:max-w-[90vw] mx-auto sm:mx-0 bg-sand border border-ink/15 rounded-xl z-50 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10">
              <p className="font-display italic text-lg">Notifications</p>
              <button
                onClick={() => {
                  setOpen(false);
                  if (unreadCount > 0) markAllNotificationsRead(notifications).catch(console.error);
                }}
                aria-label="Close"
                className="text-ink/40 hover:text-ink transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto">
              {grouped.length === 0 ? (
                <p className="text-center text-sm text-ink/40 py-10 px-4">
                  Nothing yet — votes and smashes will show up here.
                </p>
              ) : (
                grouped.map((g) => {
                  const isSmash = g.type === "smash";
                  const actorLabel = formatActors(g.actors, profiles);
                  const latestPhoto = profiles[g.latestActorUid]?.photoURL ?? g.latestActorPhotoURL;
                  return (
                    <button
                      key={g.key}
                      onClick={() => {
                        if (!g.read) {
                          g.ids.forEach((id) => markNotificationRead(id).catch(console.error));
                        }
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-ink/5 last:border-0 transition-colors ${
                        !g.read ? "bg-coral/10 hover:bg-coral/15" : "hover:bg-ink/5"
                      }`}
                    >
                      <span className="relative shrink-0">
                        {latestPhoto ? (
                          <img src={latestPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="w-10 h-10 rounded-full bg-teal text-sand flex items-center justify-center text-sm font-medium">
                            {actorLabel?.[0] ?? "?"}
                          </span>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-sand flex items-center justify-center ${
                            isSmash ? "bg-coral" : "bg-teal"
                          }`}
                        >
                          {isSmash ? (
                            <Flame size={10} className="text-sand" />
                          ) : (
                            <Heart size={10} className="text-sand" />
                          )}
                        </span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-sm leading-snug text-ink">
                          <span className="font-semibold">{actorLabel}</span>{" "}
                          <span className="text-ink/70">
                            {isSmash ? "smashed your photo 🔥" : "voted for you in a matchup"}
                          </span>
                        </span>
                        <span className="block text-xs text-ink/40 mt-1">{timeAgo(g.createdAt)}</span>
                      </span>
                      {!g.read && <span className="w-2 h-2 rounded-full bg-coral shrink-0 mt-1.5" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}