import { useState } from "react";
import { Trophy, MapPin } from "lucide-react";
import { Flame } from "lucide-react";
import { useBarangayStandings } from "../hooks/useBarangayStandings";
import { useIndividualStandings } from "../hooks/useIndividualStandings";
import { useMostSmashed } from "../hooks/useMostSmashed";

function medalFor(rank: number) {
  if (rank === 1) return { bg: "bg-[#FFD700]/15", ring: "border-[#FFD700]", text: "text-[#B8860B]", label: "🥇" };
  if (rank === 2) return { bg: "bg-[#C0C0C0]/15", ring: "border-[#A8A8A8]", text: "text-[#6B6B6B]", label: "🥈" };
  if (rank === 3) return { bg: "bg-[#CD7F32]/15", ring: "border-[#CD7F32]", text: "text-[#8B5A2B]", label: "🥉" };
  return null;
}

export default function LeaderboardCard() {
  const { standings: barangayStandings } = useBarangayStandings();
  const { standings: individualStandings } = useIndividualStandings();
  const { standings: smashStandings } = useMostSmashed();
  const [tab, setTab] = useState<"individual" | "barangay" | "smash">("individual");

  return (
    <div id="board" className="border border-ink/15 bg-sand w-full max-w-full min-w-0 flex flex-col md:mt-[31px]">
      <div className="px-4 sm:px-5 py-3 border-b border-ink/15 flex items-center justify-between gap-2 flex-wrap">
        <span className="font-display italic text-lg flex items-center gap-2 min-w-0">
          <Trophy size={18} className="text-mango shrink-0" />
          <span className="truncate">Leaderboard</span>
        </span>
        <span className="text-xs text-ink/50 shrink-0 whitespace-nowrap">updated live</span>
      </div>

      <div className="flex border-b border-ink/15">
        <button
          onClick={() => setTab("individual")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 transition-colors ${
            tab === "individual" ? "text-coral border-b-2 border-coral" : "text-ink/50 hover:text-ink"
          }`}
        >
          <Trophy size={13} />
          Individuals
        </button>
        <button
          onClick={() => setTab("barangay")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 transition-colors ${
            tab === "barangay" ? "text-coral border-b-2 border-coral" : "text-ink/50 hover:text-ink"
          }`}
        >
          <MapPin size={13} />
          Barangays
        </button>
        <button
          onClick={() => setTab("smash")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 transition-colors ${
            tab === "smash" ? "text-coral border-b-2 border-coral" : "text-ink/50 hover:text-ink"
          }`}
        >
          <Flame size={13} />
          Most Smashed
        </button>
      </div>

      {tab === "individual" ? (
        individualStandings.length > 0 ? (
          <ul>
            {individualStandings.map((p, i) => {
              const rank = i + 1;
              const medal = medalFor(rank);
              return (
                <li
                  key={p.uid}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b border-ink/10 last:border-0 transition-colors ${
                    medal ? `${medal.bg} hover:brightness-95` : "hover:bg-ink/5"
                  }`}
                >
                  {medal ? (
                    <span className={`shrink-0 w-9 h-9 rounded-full border-2 ${medal.ring} bg-sand flex items-center justify-center text-base font-medium shadow-sm`}>
                      {medal.label}
                    </span>
                  ) : (
                    <span className="font-display text-2xl text-ink/30 w-9 text-center shrink-0">{rank}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium leading-tight truncate ${medal ? medal.text : ""}`}>{p.name}</p>
                    <p className="text-xs text-ink/50 truncate">{p.barangay}</p>
                  </div>
                  <span className="text-sm text-teal font-medium shrink-0 whitespace-nowrap">{p.totalVotes} votes</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-12 text-center text-ink/50 text-sm px-4">No votes yet — cast the first one!</div>
        )
      ) : tab === "barangay" ? (
        barangayStandings.length > 0 ? (
          <ul>
            {barangayStandings.map((b, i) => {
              const rank = i + 1;
              const medal = medalFor(rank);
              return (
                <li
                  key={b.barangay}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b border-ink/10 last:border-0 transition-colors ${
                    medal ? `${medal.bg} hover:brightness-95` : "hover:bg-ink/5"
                  }`}
                >
                  {medal ? (
                    <span className={`shrink-0 w-9 h-9 rounded-full border-2 ${medal.ring} bg-sand flex items-center justify-center text-base font-medium shadow-sm`}>
                      {medal.label}
                    </span>
                  ) : (
                    <span className="font-display text-2xl text-ink/30 w-9 text-center shrink-0">{rank}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium leading-tight truncate ${medal ? medal.text : ""}`}>{b.barangay}</p>
                  </div>
                  <span className="text-sm text-teal font-medium shrink-0 whitespace-nowrap">{b.totalVotes} votes</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-12 text-center text-ink/50 text-sm px-4">No votes yet — cast the first one!</div>
        )
      ) : smashStandings.length > 0 ? (
        <ul>
          {smashStandings.map((s, i) => {
            const rank = i + 1;
            const medal = medalFor(rank);
            return (
              <li
                key={s.id}
                className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b border-ink/10 last:border-0 transition-colors ${
                  medal ? `${medal.bg} hover:brightness-95` : "hover:bg-ink/5"
                }`}
              >
                {medal ? (
                  <span className={`shrink-0 w-9 h-9 rounded-full border-2 ${medal.ring} bg-sand flex items-center justify-center text-base font-medium shadow-sm`}>
                    {medal.label}
                  </span>
                ) : (
                  <span className="font-display text-2xl text-ink/30 w-9 text-center shrink-0">{rank}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium leading-tight truncate ${medal ? medal.text : ""}`}>{s.name}</p>
                  <p className="text-xs text-ink/50 truncate">{s.barangay}</p>
                </div>
                <span className="text-sm text-coral font-medium shrink-0 whitespace-nowrap flex items-center gap-1">
                  <Flame size={12} />
                  {s.smashCount}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="py-12 text-center text-ink/50 text-sm px-4">No smashes yet — swipe on someone!</div>
      )}
    </div>
  );
}