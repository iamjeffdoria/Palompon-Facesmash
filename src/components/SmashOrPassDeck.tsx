import { useRef, useState } from "react";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { useSmashDeck } from "../hooks/useSmashDeck";
import { castSmashVote } from "../lib/smashOrPass";
import SmashOrPassCard from "./SmashOrPassCard";

export default function SmashOrPassDeck({
  myUid,
  onRequireSignIn,
}: {
  myUid: string | undefined;
  onRequireSignIn: () => void;
}) {
  const { deck, loading } = useSmashDeck(myUid);
  const [votingId, setVotingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollDeck(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 200;
    el.scrollBy({ left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16, behavior: "smooth" });
  }

  async function handleVote(photoId: string, choice: "smash" | "pass") {
    if (!myUid) {
      onRequireSignIn();
      return;
    }
    if (votingId) return;
    setVotingId(photoId);
    try {
      await castSmashVote(photoId, myUid, choice);
    } catch (err) {
      console.error(err);
    } finally {
      setVotingId(null);
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 border-t border-ink/15">
      <div className="flex items-center gap-2 mb-5">
        <Flame size={16} className="text-coral" />
        <span className="text-xs tracking-wide text-coral font-medium">Smash or Pass</span>
      </div>

      {loading ? (
        <div className="text-center text-sm text-ink/40 py-16">Loading the deck...</div>
      ) : deck.length > 0 ? (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
            style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
          >
            {deck.map((photo) => (
              <SmashOrPassCard
                key={photo.id}
                photo={photo}
                onVote={handleVote}
                voting={votingId === photo.id}
                isOwn={photo.uid === myUid}
              />
            ))}
          </div>

          {deck.length > 1 && (
            <>
              <div className="pointer-events-none absolute top-0 right-0 h-[calc(100%-16px)] w-10 bg-gradient-to-l from-sand to-transparent" />
              <button
                onClick={() => scrollDeck("left")}
                aria-label="Previous photo"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-ink text-sand w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-coral transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollDeck("right")}
                aria-label="Next photo"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-ink text-sand w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-coral transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="border border-ink/15 py-16 text-center text-ink/50 text-sm px-4">
          {myUid ? "You're all caught up — check back for new faces." : "Sign in and post a photo to start swiping."}
        </div>
      )}

      {deck.length > 0 && (
        <p className="text-center text-xs text-ink/40 mt-3">
          {deck.length} photo{deck.length > 1 ? "s" : ""} — swipe or tap the arrows
        </p>
      )}
    </section>
  );
}