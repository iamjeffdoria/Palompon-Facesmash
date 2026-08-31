import { useState } from "react";
import { Sparkles, X, UserPlus } from "lucide-react";
import { useFeaturedAndNewest } from "../hooks/useFeaturedAndNewest";

export default function FeaturedProfileModal() {
  const [open, setOpen] = useState(false);
  const { featured, newest, loading } = useFeaturedAndNewest();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium border border-mango text-mango px-3 py-1.5 hover:bg-mango hover:text-ink transition-colors"
      >
        <Sparkles size={14} />
        Spotlight
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-ink/50 flex items-center justify-center px-4 z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-sand max-w-sm w-full max-h-[85vh] overflow-y-auto border border-ink/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/15">
              <h3 className="font-display text-xl">Spotlight</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink/50 hover:text-ink transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs tracking-wide text-mango font-medium mb-3 flex items-center gap-1.5">
                <Sparkles size={13} />
                FEATURED PROFILE OF THE DAY
              </p>
              {loading ? (
                <div className="h-32 flex items-center justify-center text-ink/40 text-sm">Loading...</div>
              ) : featured ? (
                <div className="flex items-center gap-4">
                  <img src={featured.photoURL} alt={featured.name} className="w-20 h-24 object-cover" />
                  <div>
                    <p className="font-medium">{featured.name}</p>
                    <p className="text-xs text-ink/50">{featured.barangay}</p>
                    <p className="text-xs text-teal font-medium mt-1">{featured.totalVotes} total votes</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink/50">No standout yet — be the first!</p>
              )}
            </div>

            <div className="border-t border-ink/15 p-5">
              <p className="text-xs tracking-wide text-teal font-medium mb-3 flex items-center gap-1.5">
                <UserPlus size={13} />
                NEWEST MEMBERS
              </p>
              {newest.length > 0 ? (
                <ul className="space-y-3">
                  {newest.map((p) => (
                    <li key={p.uid} className="flex items-center gap-3">
                      <img src={p.photoURL} alt={p.name} className="w-10 h-12 object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-ink/50 truncate">{p.barangay}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink/50">Nobody yet — post the first photo!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}