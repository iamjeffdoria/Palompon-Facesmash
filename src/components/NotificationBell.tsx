import { useMemo, useState } from "react";
import { Bell, Flame, Heart } from "lucide-react";
import { useNotifications, type AppNotification } from "../hooks/useNotifications";
import { markAllNotificationsRead, markNotificationRead } from "../lib/notifications";
import { timeAgo } from "../lib/timeAgo";

interface GroupedNotification {
  key: string;
  type: "vote" | "smash";
  contextId: string;
  actorNames: string[];
  latestActorPhotoURL: string | null;
  read: boolean;
  createdAt: number;
  ids: string[];
}

function formatActors(names: string[]): string {
  const unique = [...new Set(names)];
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique[0]} and ${unique.length - 1} others`;
}

function groupNotifications(notifications: AppNotification[]): GroupedNotification[] {
  const groups = new Map<string, GroupedNotification>();

  // notifications arrive newest-first, so the first actor seen per group is the latest
  for (const n of notifications) {
    const key = `${n.type}:${n.contextId}`;
    const existing = groups.get(key);
    if (existing) {
      existing.actorNames.push(n.actorName);
      existing.ids.push(n.id);
      existing.read = existing.read && n.read;
      if (n.createdAt > existing.createdAt) {
        existing.createdAt = n.createdAt;
        existing.latestActorPhotoURL = n.actorPhotoURL;
      }
    } else {
      groups.set(key, {
        key,
        type: n.type,
        contextId: n.contextId,
        actorNames: [n.actorName],
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
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpen(false);
              if (unreadCount > 0) markAllNotificationsRead(notifications).catch(console.error);
            }}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-sand border border-ink/15 z-50 shadow-lg">
            <div className="px-4 py-3 border-b border-ink/10">
              <p className="font-display italic text-lg">Notifications</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {grouped.length === 0 ? (
                <p className="text-center text-sm text-ink/40 py-10 px-4">
                  Nothing yet — votes and smashes will show up here.
                </p>
              ) : (
                grouped.map((g) => {
                  const isSmash = g.type === "smash";
                  const actorLabel = formatActors(g.actorNames);
                  return (
                    <button
                      key={g.key}
                      onClick={() => {
                        if (!g.read) {
                          g.ids.forEach((id) => markNotificationRead(id).catch(console.error));
                        }
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-ink/5 last:border-0 transition-colors ${
                        !g.read
                          ? "bg-coral/10 border-l-4 border-l-coral hover:bg-coral/15"
                          : "border-l-4 border-l-transparent opacity-60 hover:bg-ink/5"
                      }`}
                    >
                      <span className="relative shrink-0">
                        {g.latestActorPhotoURL ? (
                          <img src={g.latestActorPhotoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="w-10 h-10 rounded-full bg-teal text-sand flex items-center justify-center text-sm font-medium">
                            {g.actorNames[0]?.[0] ?? "?"}
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
                        <span className={`text-sm leading-snug ${!g.read ? "text-ink" : "text-ink/60"}`}>
                          <span className="font-medium">{actorLabel}</span>{" "}
                          {isSmash ? "smashed your photo 🔥" : "voted for you in a matchup"}
                        </span>
                        <span className="block text-xs text-ink/40 mt-0.5">{timeAgo(g.createdAt)}</span>
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