import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { Share2 } from "lucide-react";
import { db } from "../lib/firebase";

interface MatchSide {
  uid: string;
  name: string;
  barangay: string;
  photoURL: string;
}

export default function MatchFoundModal({
  photoId,
  localPreview,
  myUid,
  onClose,
}: {
  photoId: string;
  localPreview: string;
  myUid: string;
  onClose: () => void;
}) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<MatchSide | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "photos", photoId), (snap) => {
      const data = snap.data();
      if (data?.status === "matched" && data.matchId) setMatchId(data.matchId);
    });
    return () => unsub();
  }, [photoId]);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, "matches", matchId), (snap) => {
      const data = snap.data();
      if (!data) return;
      const sides = Object.values(data.sides) as MatchSide[];
      setOpponent(sides.find((s) => s.uid !== myUid) ?? null);
    });
    return () => unsub();
  }, [matchId, myUid]);

  const phase = matchId ? "matched" : "searching";

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Vote for me on PalomponFacesmash!", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-6 z-50">
      <div className="bg-sand max-w-sm w-full p-8 border border-ink/15 text-center">
        {phase === "searching" ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-coral/20 border-t-coral animate-spin" />
            <h3 className="font-display text-2xl mb-2">You're in the arena</h3>
            <p className="text-sm text-ink/60 min-h-[2.5em]">Finding you a rival...</p>
          </>
        ) : (
          <>
            <p className="text-xs tracking-wide text-coral font-medium mb-2">MATCH FOUND</p>
            <h3 className="font-display text-2xl mb-6">Round 1 is live</h3>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex flex-col items-center">
                <img src={localPreview} alt="You" className="w-20 h-24 object-cover border border-ink/15 mb-1" />
                <span className="text-xs font-medium">You</span>
              </div>
              <span className="font-display text-2xl text-coral italic">vs</span>
              <div className="flex flex-col items-center">
                {opponent ? (
                  <img src={opponent.photoURL} alt={opponent.name} className="w-20 h-24 object-cover border border-ink/15 mb-1" />
                ) : (
                  <div className="w-20 h-24 bg-ink/5 border border-ink/15 mb-1 flex items-center justify-center text-ink/20 font-display text-xl">
                    ?
                  </div>
                )}
                <span className="text-xs font-medium">{opponent?.name ?? "..."}</span>
              </div>
            </div>
            <p className="text-sm text-ink/60 mb-6">
              {opponent?.barangay ?? "Someone"} just got the notification. First votes land within the hour — get your friends voting before they do.
            </p>
            <button onClick={handleShare} className="w-full bg-coral text-sand py-3 font-medium hover:bg-ink transition-colors mb-2 flex items-center justify-center gap-2">
              <Share2 size={18} />
              Share for votes
            </button>
            <button onClick={onClose} className="w-full text-sm text-ink/50 hover:text-ink py-2 transition-colors">
              Back to the board
            </button>
          </>
        )}
      </div>
    </div>
  );
}