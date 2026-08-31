import { useEffect, useMemo, useState } from "react";
import { Flame, Check, X, Expand, Clock } from "lucide-react";
import { useVoterRecord } from "../hooks/useVoterRecord";
import type { MatchData } from "../hooks/useLatestMatch";
import PhotoViewerModal from "./PhotoViewerModal";

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Closed";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export default function MatchCard({
  match,
  myUid,
  onVote,
  votingFor,
}: {
  match: MatchData;
  myUid: string | undefined;
  onVote: (matchId: string, sideUid: string) => void;
  votingFor: string | null;
}) {
  const votedFor = useVoterRecord(match.id, myUid);
  const [confirmingUid, setConfirmingUid] = useState<string | null>(null);
  const [viewingUid, setViewingUid] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000); // tick every 30s
    return () => clearInterval(interval);
  }, []);

  const timeLeftMs = match.closesAt ? match.closesAt - now : Infinity;
  const isClosed = timeLeftMs <= 0;

  // Firestore doesn't guarantee map-field key order, so pin the left/right
  // order once per match by sorting on uid — this stops sides from
  // swapping places on re-renders (e.g. after a vote comes in).
  const orderedSides = useMemo(
    () => Object.values(match.sides).sort((a, b) => a.uid.localeCompare(b.uid)),
    [match.id]
  );

  const viewingSide = orderedSides.find((s) => s.uid === viewingUid) ?? null;

  return (
    <div className="border-2 border-ink/70 bg-sand shrink-0 w-[82vw] max-w-[280px] sm:w-[280px] snap-start overflow-hidden">
      {match.closesAt && (
        <div
          className={`flex items-center justify-center gap-1 text-[10px] font-medium py-1.5 ${
            isClosed ? "bg-ink/10 text-ink/50" : "bg-mango/20 text-ink/70"
          }`}
        >
          <Clock size={10} />
          {isClosed ? "Voting closed" : formatTimeLeft(timeLeftMs)}
        </div>
      )}
      {!votedFor && !isClosed && (
        <p className="text-center text-[11px] text-ink/40 px-3 pt-3">
          One vote per matchup — can't be undone.
        </p>
      )}
      <div className="relative grid grid-cols-2 divide-x-2 divide-ink/70 mt-2">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-coral text-sand font-display italic text-sm w-9 h-9 rounded-full flex items-center justify-center border-2 border-sand shadow-md">
          VS
        </span>
        {orderedSides.map((p) => {
          const isVoted = votedFor === p.uid;
          const isOtherVoted = votedFor !== null && votedFor !== p.uid;
          const voteCount = match.votes?.[p.uid] ?? 0;
          const isVoting = votingFor === `${match.id}:${p.uid}`;
          const isConfirming = confirmingUid === p.uid;

          return (
            <div
              key={p.uid}
              className={`flex flex-col items-center text-center px-3 py-6 min-w-0 transition-opacity ${
                isOtherVoted ? "opacity-40" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setViewingUid(p.uid)}
                className="relative group w-16 h-20 mb-2 shrink-0"
                aria-label={`View ${p.name}'s photo`}
              >
                <img src={p.photoURL} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-center justify-center">
                  <Expand size={16} className="text-sand opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>

              <div className="h-[2.4em] w-full flex items-center justify-center px-1">
                <p className="font-medium text-xs leading-tight line-clamp-2">{p.name}</p>
              </div>
              <p className="text-[10px] text-ink/50 mb-1 h-[1.2em]">{p.barangay}</p>
              <p className="text-[10px] text-teal font-medium mb-2">{voteCount} votes</p>
              {isVoted ? (
                <span className="inline-flex items-center gap-1 bg-teal/15 text-teal text-xs font-medium px-2.5 py-1 rounded-full">
                  <Check size={12} />
                  Voted
                </span>
              ) : isConfirming || isVoting ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onVote(match.id, p.uid)}
                    disabled={votingFor !== null}
                    className="bg-teal text-sand px-2.5 py-1.5 text-xs font-medium hover:bg-ink transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    {isVoting ? (
                      <span className="w-3 h-3 border-2 border-sand/40 border-t-sand rounded-full animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Sure?
                  </button>
                  {!isVoting && (
                    <button
                      onClick={() => setConfirmingUid(null)}
                      className="bg-ink/10 text-ink px-2 py-1.5 hover:bg-ink/20 transition-colors"
                      aria-label="Cancel"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingUid(p.uid)}
                  disabled={votedFor !== null || votingFor !== null || isClosed}
                  className="bg-coral text-sand px-3 py-1.5 text-xs font-medium hover:bg-ink transition-colors disabled:opacity-40 disabled:hover:bg-coral flex items-center gap-1"
                >
                  <Flame size={12} />
                  Vote
                </button>
              )}
            </div>
          );
        })}
      </div>

      {viewingSide && (
        <PhotoViewerModal
          photoURL={viewingSide.photoURL}
          name={viewingSide.name}
          barangay={viewingSide.barangay}
          onClose={() => setViewingUid(null)}
        />
      )}
    </div>
  );
}