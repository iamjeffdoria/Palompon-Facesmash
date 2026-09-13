import { useEffect, useState } from "react";
import { Flame, Share2, X } from "lucide-react";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import type { StreakEvent } from "../hooks/useStreak";

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

const COPY: Record<StreakEvent["type"], { eyebrow: string; title: (n: number) => string; body: string }> = {
  first: {
    eyebrow: "STREAK STARTED",
    title: () => "Day 1. Let's go.",
    body: "Come back tomorrow to keep the flame alive — miss a day and it resets to zero.",
  },
  continued: {
    eyebrow: "STREAK UP",
    title: (n) => `${n} day streak!`,
    body: "You're building something here. Don't let it die tomorrow.",
  },
  reset: {
    eyebrow: "FRESH START",
    title: () => "Streak reset — Day 1",
    body: "Yesterday slipped by, but today's a clean slate. Let's build it back up.",
  },
};

export default function StreakCelebrationModal({
  event,
  onClose,
}: {
  event: StreakEvent;
  onClose: () => void;
}) {
  useLockBodyScroll();
  const [countdown, setCountdown] = useState(() => msUntilMidnight());
  const copy = COPY[event.type];

  useEffect(() => {
    const interval = setInterval(() => setCountdown(msUntilMidnight()), 60000);
    return () => clearInterval(interval);
  }, []);

  function handleShare() {
    const text = `I'm on a ${event.value}-day streak on PalomponFacesmash 🔥`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  }

  const flamePips = Math.min(event.value, 7);

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center px-4 z-[70]" onClick={onClose}>
      <div
        className="bg-sand max-w-sm w-full p-7 border border-ink/15 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-ink/40 hover:text-ink transition-colors"
        >
          <X size={20} />
        </button>
        <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <span className="absolute inset-0 bg-coral/15 rounded-full animate-ping" />
          <span className="relative bg-coral text-sand rounded-full w-16 h-16 flex items-center justify-center">
            <Flame size={30} />
          </span>
        </div>
        <p className="text-xs tracking-wide text-coral font-semibold mb-1">{copy.eyebrow}</p>
        <h3 className="font-display text-3xl mb-2">{copy.title(event.value)}</h3>
        <p className="text-sm text-ink/60 mb-4">{copy.body}</p>
        <div className="flex items-center justify-center gap-1 mb-5">
          {Array.from({ length: flamePips }).map((_, i) => (
            <Flame
              key={i}
              size={16}
              className={i < flamePips ? "text-coral fill-coral" : "text-ink/15"}
            />
          ))}
          {event.value > 7 && (
            <span className="text-xs text-ink/50 ml-1">+{event.value - 7}</span>
          )}
        </div>
        <div className="bg-mango/15 border border-mango/30 px-3 py-2 mb-5">
          <p className="text-xs text-ink/70">
            New day resets in <span className="font-semibold">{formatCountdown(countdown)}</span> — come back before then.
          </p>
        </div>
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-coral text-sand py-2.5 font-medium hover:bg-ink transition-colors mb-2"
        >
          <Share2 size={16} />
          Show off my streak
        </button>
        <button onClick={onClose} className="w-full text-sm text-ink/50 hover:text-ink py-2 transition-colors">
          Keep browsing
        </button>
      </div>
    </div>
  );
}