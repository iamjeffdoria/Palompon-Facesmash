import { useMemo, useState } from "react";
import { Sparkles, X, UserPlus, Crown } from "lucide-react";
import { useFeaturedAndNewest } from "../hooks/useFeaturedAndNewest";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useUserProfiles } from "../hooks/useUserProfiles";
export default function FeaturedProfileModal() {
  const [open, setOpen] = useState(false);
  const { featured, newest, loading } = useFeaturedAndNewest();
  const spotlightUids = useMemo(
    () => [...(featured ? [featured.uid] : []), ...newest.map((p) => p.uid)],
    [featured, newest]
  );
  const profiles = useUserProfiles(spotlightUids);
  useLockBodyScroll(open);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 border border-mango text-mango px-3 py-1.5 hover:bg-mango hover:text-ink transition-colors"
      >
        <Sparkles size={15} />
        Spotlight
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-ink/60 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8 z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-sand max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-ink/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-ink/15 sticky top-0 bg-sand z-10">
              <h3 className="font-display text-xl sm:text-2xl">Spotlight</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink/50 hover:text-ink transition-colors shrink-0">
                <X size={22} />
              </button>
            </div>

            {/* Featured — hero card */}
            <div className="p-4 sm:p-6">
              <p className="text-xs tracking-wide text-mango font-semibold mb-4 flex items-center gap-1.5">
                <Sparkles size={14} />
                FEATURED PROFILE OF THE DAY
              </p>

              {loading ? (
                <div className="h-40 flex items-center justify-center text-ink/40 text-sm bg-mango/10">Loading...</div>
              ) : featured ? (
                <div className="relative bg-mango/15 border-2 border-mango overflow-hidden">
                  <div className="absolute top-3 right-3 bg-mango text-ink rounded-full p-1.5">
                    <Crown size={16} />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 text-center sm:text-left">
                    <img
                      src={profiles[featured.uid]?.photoURL || featured.photoURL}
                      alt={profiles[featured.uid]?.name || featured.name}
                      className="w-24 h-32 sm:w-28 sm:h-36 object-cover border-2 border-mango shrink-0"
                    />
                    <div className="min-w-0 w-full">
                      <p className="font-display text-xl sm:text-2xl leading-tight truncate">{profiles[featured.uid]?.name || featured.name}</p>
                      <p className="text-sm text-ink/60 mt-1 truncate">{featured.barangay}</p>
                      <p className="text-sm text-teal font-semibold mt-3 bg-teal/10 inline-block px-2.5 py-1">
                        {featured.totalVotes} total votes
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-mango/10 border-2 border-dashed border-mango/40 py-10 text-center text-sm text-ink/50">
                  No standout yet — be the first!
                </div>
              )}
            </div>

            {/* Newest members — card grid */}
            <div className="border-t border-ink/15 p-4 sm:p-6">
              <p className="text-xs tracking-wide text-teal font-semibold mb-4 flex items-center gap-1.5">
                <UserPlus size={14} />
                NEWEST MEMBERS
              </p>

              {newest.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {newest.map((p) => (
                    <div
                      key={p.uid}
                      className="bg-teal/10 border border-teal/30 p-3 flex flex-col items-center text-center hover:bg-teal/20 transition-colors"
                    >
                      <img
                        src={profiles[p.uid]?.photoURL || p.photoURL}
                        alt={profiles[p.uid]?.name || p.name}
                        className="w-16 h-20 object-cover mb-2 border border-teal/30"
                      />
                      <p className="text-sm font-medium leading-tight truncate w-full">{profiles[p.uid]?.name || p.name}</p>
                      <p className="text-xs text-ink/50 truncate w-full">{p.barangay}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-teal/10 border-2 border-dashed border-teal/40 py-10 text-center text-sm text-ink/50">
                  Nobody yet — post the first photo!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}