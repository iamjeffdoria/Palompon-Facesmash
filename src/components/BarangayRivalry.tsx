import { Flame, MapPin } from "lucide-react";
import { useBarangayStandings } from "../hooks/useBarangayStandings";

export default function BarangayRivalry({ onJoinClick }: { onJoinClick: () => void }) {
  const { standings } = useBarangayStandings();
  if (standings.length < 2) return null;
  const [first, second] = standings;
  const gap = first.totalVotes - second.totalVotes;

  return (
    <div className="bg-ink text-sand px-4 sm:px-6 md:px-10 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm sm:text-base flex items-center gap-2 text-center sm:text-left">
          <MapPin size={16} className="text-mango shrink-0" />
          <span>
            <span className="font-semibold text-mango">{first.barangay}</span> is leading by{" "}
            <span className="font-semibold">{gap}</span> vote{gap !== 1 ? "s" : ""} over{" "}
            <span className="font-semibold">{second.barangay}</span>.
          </span>
        </p>
        <button
          onClick={onJoinClick}
          className="shrink-0 flex items-center gap-1.5 bg-coral text-sand px-4 py-2 text-sm font-medium hover:bg-mango hover:text-ink transition-colors"
        >
          <Flame size={14} />
          Rep your barangay
        </button>
      </div>
    </div>
  );
}