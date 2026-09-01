import { useRef, useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import MatchCard from "./MatchCard";
import type { MatchData } from "../hooks/useLatestMatch";

export default function MatchupBoard({
  matches,
  hasUser,
  onVote,
  votingFor,
  onShowUpload,
  myUid,
}: {
  matches: MatchData[];
  hasUser: boolean;
  onVote: (matchId: string, sideUid: string) => void;
  votingFor: string | null;
  onShowUpload: () => void;
  myUid: string | undefined;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((m) =>
      Object.values(m.sides).some(
        (p) => p.name.toLowerCase().includes(q) || p.barangay.toLowerCase().includes(q)
      )
    );
  }, [matches, searchQuery]);

  function scrollMatches(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 280;
    el.scrollBy({ left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16, behavior: "smooth" });
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
          <span className="text-xs tracking-wide text-coral font-medium">Voting now</span>
        </div>
        {hasUser && (
          <button
            onClick={onShowUpload}
            aria-label="Post your photo"
            className="md:hidden flex items-center gap-1.5 border border-coral text-coral px-3 py-1.5 text-xs font-medium hover:bg-coral hover:text-sand transition-colors shrink-0"
          >
            <Camera size={15} />
            Post photo
          </button>
        )}
      </div>

      <div className="relative mb-4">
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

      {filteredMatches.length > 0 ? (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
            style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
          >
            {filteredMatches.map((m) => (
              <MatchCard key={m.id} match={m} myUid={myUid} onVote={onVote} votingFor={votingFor} />
            ))}
          </div>

          {filteredMatches.length > 1 && (
            <>
              <div className="pointer-events-none absolute top-0 right-0 h-[calc(100%-16px)] w-10 bg-gradient-to-l from-sand to-transparent" />
              <button
                onClick={() => scrollMatches("left")}
                aria-label="Previous matchup"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-ink text-sand w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-coral transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollMatches("right")}
                aria-label="Next matchup"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-ink text-sand w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-coral transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="border border-ink/15 py-16 text-center text-ink/50 text-sm px-4">
          {searchQuery ? `No matchups found for "${searchQuery}".` : "No matchups yet — be the first to post a photo!"}
        </div>
      )}
      <p className="text-center text-xs text-ink/40 mt-3">
        {filteredMatches.length > 0
          ? `${filteredMatches.length} matchup${filteredMatches.length > 1 ? "s" : ""}${searchQuery ? " found" : " live"} — swipe or tap the arrows`
          : ""}
      </p>
    </div>
  );
}