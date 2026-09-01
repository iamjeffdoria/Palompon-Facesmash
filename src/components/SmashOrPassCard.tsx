import { Flame, X } from "lucide-react";
import type { SmashPhoto } from "../hooks/useSmashDeck";

export default function SmashOrPassCard({
  photo,
  onVote,
  voting,
  isOwn,
}: {
  photo: SmashPhoto;
  onVote: (photoId: string, choice: "smash" | "pass") => void;
  voting: boolean;
  isOwn: boolean;
}) {
  return (
    <div className="border-2 border-ink/70 bg-sand shrink-0 w-[45vw] max-w-[140px] sm:w-[140px] snap-start overflow-hidden">
      <div className="relative aspect-[3/4] bg-ink/5">
        <img src={photo.photoURL} alt={photo.name} className="w-full h-full object-cover" />
      </div>

      <div className="px-2 py-2 text-center">
        <p className="font-medium text-xs truncate">{photo.name}</p>
        <p className="text-[10px] text-ink/50 truncate">{photo.barangay}</p>
      </div>

      {isOwn ? (
        <p className="text-center text-[10px] text-ink/40 pb-2">Your photo</p>
      ) : photo.myChoice ? (
        <div className="flex items-center justify-center pb-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
              photo.myChoice === "smash" ? "bg-coral/15 text-coral" : "bg-ink/10 text-ink/50"
            }`}
          >
            {photo.myChoice === "smash" ? <Flame size={10} /> : <X size={10} />}
            {photo.myChoice === "smash" ? "Smashed" : "Passed"}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 pb-2">
          <button
            onClick={() => onVote(photo.id, "pass")}
            disabled={voting}
            aria-label="Pass"
            className="w-8 h-8 rounded-full border-2 border-ink/20 flex items-center justify-center hover:border-ink hover:bg-ink/5 transition-colors disabled:opacity-40"
          >
            <X size={14} className="text-ink/60" />
          </button>
          <button
            onClick={() => onVote(photo.id, "smash")}
            disabled={voting}
            aria-label="Smash"
            className="w-8 h-8 rounded-full bg-coral text-sand flex items-center justify-center hover:bg-ink transition-colors disabled:opacity-40"
          >
            <Flame size={14} />
          </button>
        </div>
      )}
    </div>
  );
}