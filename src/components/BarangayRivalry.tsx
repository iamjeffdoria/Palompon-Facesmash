import { Flame, MapPin } from "lucide-react";
import { useBarangayStandings } from "../hooks/useBarangayStandings";

export default function BarangayRivalry({ onJoinClick }: { onJoinClick: () => void }) {
  const { standings } = useBarangayStandings();
  if (standings.length < 2) return null;
  const [first, second] = standings;
  const gap = first.totalVotes - second.totalVotes;

  return (
    <div className="bg-ink text-sand px-3 sm:px-6 md:px-10 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <p className="text-xs sm:text-sm flex items-center gap-1.5 min-w-0 truncate">
          <MapPin size={13} className="text-mango shrink-0" />
          <span className="truncate">
            <span className="font-semibold text-mango">{first.barangay}</span> leads by{" "}
            <span className="font-semibold">{gap}</span> vote{gap !== 1 ? "s" : ""} over{" "}
            <span className="font-semibold">{second.barangay}</span>
          </span>
        </p>
        <button
          onClick={onJoinClick}
          className="shrink-0 flex items-center gap-1 bg-coral text-sand px-2.5 py-1 text-xs font-medium hover:bg-mango hover:text-ink transition-colors"
        >
          <Flame size={12} />
          <span className="hidden sm:inline">Rep your barangay</span>
          <span className="sm:hidden">Rep</span>
        </button>
      </div>
    </div>
  );
}