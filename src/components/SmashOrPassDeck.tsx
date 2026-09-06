import { useRef, useState, useMemo, useEffect } from "react";
import { Flame, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useSmashDeck } from "../hooks/useSmashDeck";
import { castSmashVote } from "../lib/smashOrPass";
import SmashOrPassCard from "./SmashOrPassCard";

export default function SmashOrPassDeck({
  myUid,
  myName,
  myPhotoURL,
  pendingSmash,
  onRequireSignIn,
  onPendingSmashResolved,
  onVoteError,
}: {
  myUid: string | undefined;
  myName: string | null;
  myPhotoURL: string | null;
  pendingSmash: { photoId: string; choice: "smash" | "pass" } | null;
  onRequireSignIn: (photoId: string, choice: "smash" | "pass") => void;
  onPendingSmashResolved: () => void;
  onVoteError: () => void;
}) {
  const { deck, loading } = useSmashDeck(myUid);
  const [votingId, setVotingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDeck = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deck;
    return deck.filter(
      (p) => p.name.toLowerCase().includes(q) || p.barangay.toLowerCase().includes(q)
    );
  }, [deck, searchQuery]);

  function scrollDeck(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 200;
    el.scrollBy({ left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16, behavior: "smooth" });
  }

  async function handleVote(photoId: string, choice: "smash" | "pass") {
    if (!myUid) {
      onRequireSignIn(photoId, choice);
      return;
    }
    if (votingId) return;
    const photo = deck.find((p) => p.id === photoId);
    if (!photo) return;
    setVotingId(photoId);
    try {
      await castSmashVote(photoId, myUid, choice, photo.uid, {
        name: myName ?? "Someone",
        photoURL: myPhotoURL,
      });
    } catch (err) {
      console.error(err);
      onVoteError();
    } finally {
      setVotingId(null);
    }
  }

  // Resume a smash/pass that was queued while signed out, as soon as the
  // person finishes signing in and this deck has the photo loaded.
  useEffect(() => {
    if (!myUid || !pendingSmash || loading) return;
    const photo = deck.find((p) => p.id === pendingSmash.photoId);
    if (!photo) return; // photo not loaded into this deck yet, wait
    handleVote(pendingSmash.photoId, pendingSmash.choice);
    onPendingSmashResolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUid, pendingSmash, loading, deck]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 border-t border-ink/15">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={16} className="text-coral" />
        <span className="text-xs tracking-wide text-coral font-medium">Smash or Pass</span>
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-ink/40 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
          live
        </span>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or barangay..."
          className="w-full border border-ink/20 bg-sand pl-9 pr-9 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:border-coral transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-sm text-ink/40 py-16">Loading the deck...</div>
      ) : filteredDeck.length > 0 ? (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
            style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
          >
            {filteredDeck.map((photo) => (
              <SmashOrPassCard
                key={photo.id}
                photo={photo}
                onVote={handleVote}
                voting={votingId === photo.id}
                isOwn={photo.uid === myUid}
              />
            ))}
          </div>

          {filteredDeck.length > 1 && (
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
          {searchQuery
            ? `No matches found for "${searchQuery}".`
            : myUid
            ? "You're all caught up — check back for new faces."
            : "Sign in and post a photo to start swiping."}
        </div>
      )}

      {filteredDeck.length > 0 && (
        <p className="text-center text-xs text-ink/40 mt-3">
          {filteredDeck.length} photo{filteredDeck.length > 1 ? "s" : ""}{searchQuery ? " found" : ""} — swipe or tap the arrows
        </p>
      )}
    </section>
  );
}