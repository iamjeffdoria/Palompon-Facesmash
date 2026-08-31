import { useState, useRef, useMemo } from "react";
import { Menu, X, Camera, Trophy, Flame, Share2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useActiveMatches } from "../hooks/useActiveMatches";
import { castVote } from "../lib/vote";
import MatchCard from "../components/MatchCard";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../lib/firebase";
import AccountMenu from "../components/AccountMenu";
import SignInModal from "../components/SignInModal";
import UploadPhotoModal from "../components/UploadPhotoModal";
import MatchFoundModal from "../components/MatchFoundModal";
import SmashOrPassDeck from "../components/SmashOrPassDeck";
import Toast, { type ToastData } from "../components/Toast";
import { uploadPhotoAndQueue } from "../lib/uploadPhoto";
import { seedBots } from "../lib/seedBots";

const leaderboard = [
  { rank: 1, name: "Marga D.", barangay: "Poblacion", votes: 812 },
  { rank: 2, name: "Jhun-Jhun R.", barangay: "Cangcosme", votes: 795 },
  { rank: 3, name: "Ate Vhel", barangay: "Camotes", votes: 740 },
  { rank: 4, name: "Kyle T.", barangay: "Mahayahay", votes: 703 },
  { rank: 5, name: "Neneng P.", barangay: "Tinugtogan", votes: 668 },
];

const steps = [
  { n: "1", title: "Post your photo", body: "Light filters are fine, just don't edit yourself into an unrecognizable stranger." },
  { n: "2", title: "Get matched", body: "You're paired against another Palomponganon, head to head." },
  { n: "3", title: "Town decides", body: "Every vote updates the board in real time, barangay by barangay." },
];

export default function Landing() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [matchPhotoId, setMatchPhotoId] = useState<string | null>(null);
  const [matchLocalPreview, setMatchLocalPreview] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<{ matchId: string; sideUid: string } | null>(null);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const { user, loading, signInWithGoogle, logOut } = useAuth();
  const { matches } = useActiveMatches();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // @ts-ignore
  window.seedBots = seedBots;

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

  async function handleVoteClick(matchId: string, sideUid: string) {
    if (!user) {
      setPendingVote({ matchId, sideUid });
      setShowSignIn(true);
      return;
    }
    setVotingFor(`${matchId}:${sideUid}`);
    try {
      await castVote(matchId, user.uid, sideUid);
    } catch (err) {
      console.error(err);
    } finally {
      setVotingFor(null);
    }
  }

  function handleJoinClick() {
    if (user) {
      setShowUploadModal(true);
    } else {
      setPendingUpload(true);
      setShowSignIn(true);
    }
  }

  async function handleSignIn() {
    await signInWithGoogle();
    const freshUid = auth.currentUser?.uid;
    const freshName = auth.currentUser?.displayName?.split(" ")[0];
    setToast({ message: `Welcome${freshName ? `, ${freshName}` : ""}!`, type: "success" });
    if (pendingVote && freshUid) {
      castVote(pendingVote.matchId, freshUid, pendingVote.sideUid).catch(console.error);
      setPendingVote(null);
    }
    if (pendingUpload) {
      setPendingUpload(false);
      setShowUploadModal(true);
    }
  }

  function handleLogOut() {
    logOut();
    setToast({ message: "Signed out — see you around!", type: "info" });
  }

  async function handlePhotoUpload(file: File, includeInSmashOrPass: boolean) {
    if (!user) return;
    setMatchLocalPreview(URL.createObjectURL(file));
    const { photoId } = await uploadPhotoAndQueue(
      file,
      { uid: user.uid, displayName: user.displayName },
      { includeInSmashOrPass }
    );
    setMatchPhotoId(photoId);
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-sand text-ink font-body">
      <header className="border-b border-ink/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="font-display text-xl tracking-tight">
            Palompon<span className="text-coral italic">Facesmash</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {!loading && (
              <>
                {!user && (
                  <>
                    <a href="#how" className="hover:text-coral transition-colors">How it works</a>
                    <a href="#board" className="hover:text-coral transition-colors">Leaderboard</a>
                  </>
                )}
                {user ? (
                  <>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-1.5 border border-coral text-coral px-3 py-1.5 hover:bg-coral hover:text-sand transition-colors"
                    >
                      <Camera size={15} />
                      Post photo
                    </button>
                    <AccountMenu user={user} onSignOut={handleLogOut} />
                  </>
                ) : (
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="bg-ink text-sand px-4 py-2 hover:bg-coral transition-colors"
                  >
                    Sign in
                  </button>
                )}
              </>
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden p-2"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-ink/15 px-4 sm:px-6 py-4 flex flex-col gap-4 text-sm">
            {!loading && (
              <>
                {!user && (
                  <>
                    <a href="#how" onClick={() => setMobileMenuOpen(false)} className="hover:text-coral transition-colors">
                      How it works
                    </a>
                    <a href="#board" onClick={() => setMobileMenuOpen(false)} className="hover:text-coral transition-colors">
                      Leaderboard
                    </a>
                  </>
                )}
                {user ? (
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-teal text-sand flex items-center justify-center text-sm font-medium">
                        {user.displayName?.[0] ?? "U"}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.displayName}</p>
                      <p className="text-xs text-ink/50 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogOut();
                      }}
                      className="text-xs text-coral hover:text-ink transition-colors shrink-0"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowSignIn(true);
                    }}
                    className="bg-ink text-sand px-4 py-2 hover:bg-coral transition-colors w-fit"
                  >
                    Sign in
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </header>

      {/* Closable banner */}
      {showBanner && !loading && !user && (
        <div className="bg-mango/20 border-b border-ink/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
            <p className="text-sm md:text-base font-display italic">
              Whose facecard never declines?
            </p>
            <button
              onClick={() => setShowBanner(false)}
              aria-label="Dismiss banner"
              className="shrink-0 text-ink/50 hover:text-ink transition-colors px-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Location strip */}
      {!user && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-4 border-b border-ink/15 flex items-center justify-between gap-4">
          <p className="text-sm text-teal font-medium">Palompon, Leyte</p>
          <button
            onClick={handleJoinClick}
            className="bg-coral text-sand px-5 py-2 text-sm font-medium hover:bg-ink transition-colors"
          >
            Wanna join?
          </button>
        </section>
      )}

      {/* Main highlight: live matchup + leaderboard side by side */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8 grid md:grid-cols-2 gap-8 md:gap-10 items-start">
        {/* Live matchup */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
              <span className="text-xs tracking-wide text-coral font-medium">Voting now</span>
            </div>
            {user && (
              <button
                onClick={() => setShowUploadModal(true)}
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
                  <MatchCard
                    key={m.id}
                    match={m}
                    myUid={user?.uid}
                    onVote={handleVoteClick}
                    votingFor={votingFor}
                  />
                ))}
              </div>

              {filteredMatches.length > 1 && (
                <>
                  {/* fade hint on the right edge */}
                  <div className="pointer-events-none absolute top-0 right-0 h-[calc(100%-16px)] w-10 bg-gradient-to-l from-sand to-transparent" />

                  {/* obvious tap-to-scroll arrows, mobile + desktop */}
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
              {searchQuery
                ? `No matchups found for "${searchQuery}".`
                : "No matchups yet — be the first to post a photo!"}
            </div>
          )}
          <p className="text-center text-xs text-ink/40 mt-3">
            {filteredMatches.length > 0
              ? `${filteredMatches.length} matchup${filteredMatches.length > 1 ? "s" : ""}${searchQuery ? " found" : " live"} — swipe or tap the arrows`
              : ""}
          </p>
        </div>

        {/* Leaderboard */}
        <div id="board" className="border border-ink/15 bg-sand w-full max-w-full min-w-0 flex flex-col md:mt-[31px]">
          <div className="px-4 sm:px-5 py-3 border-b border-ink/15 flex items-center justify-between gap-2 flex-wrap">
            <span className="font-display italic text-lg flex items-center gap-2 min-w-0">
              <Trophy size={18} className="text-mango shrink-0" />
              <span className="truncate">This week's top 5</span>
            </span>
            <span className="text-xs text-ink/50 shrink-0 whitespace-nowrap">updated live</span>
          </div>
          <ul>
            {leaderboard.map((p) => {
              const medal =
                p.rank === 1
                  ? { bg: "bg-[#FFD700]/15", ring: "border-[#FFD700]", text: "text-[#B8860B]", label: "🥇" }
                  : p.rank === 2
                  ? { bg: "bg-[#C0C0C0]/15", ring: "border-[#A8A8A8]", text: "text-[#6B6B6B]", label: "🥈" }
                  : p.rank === 3
                  ? { bg: "bg-[#CD7F32]/15", ring: "border-[#CD7F32]", text: "text-[#8B5A2B]", label: "🥉" }
                  : null;

              return (
                <li
                  key={p.rank}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b border-ink/10 last:border-0 transition-colors ${
                    medal ? `${medal.bg} hover:brightness-95` : "hover:bg-ink/5"
                  }`}
                >
                  {medal ? (
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full border-2 ${medal.ring} bg-sand flex items-center justify-center text-base font-medium shadow-sm`}
                    >
                      {medal.label}
                    </span>
                  ) : (
                    <span className="font-display text-2xl text-ink/30 w-9 text-center shrink-0">{p.rank}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium leading-tight truncate ${medal ? medal.text : ""}`}>{p.name}</p>
                    <p className="text-xs text-ink/50 truncate">{p.barangay}</p>
                  </div>
                  <span className="text-sm text-teal font-medium shrink-0 whitespace-nowrap">{p.votes} votes</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <SmashOrPassDeck myUid={user?.uid} onRequireSignIn={() => setShowSignIn(true)} />

      {!user && (
        <>
          <section id="how" className="border-y border-ink/15 bg-ink text-sand">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 grid md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.n} className={i !== 0 ? "py-8 md:py-0 md:px-8 md:border-l border-sand/20" : "py-8 md:py-0 md:px-8"}>
                  <span className="font-display text-4xl text-mango">{s.n}</span>
                  <h3 className="mt-4 text-xl font-medium">{s.title}</h3>
                  <p className="mt-2 text-sand/70">{s.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-3 divide-x divide-ink/15 border-b border-ink/15">
            {[
              { value: "4,120", label: "votes cast today" },
              { value: "38", label: "barangays repping" },
              { value: "612", label: "faces in the running" },
            ].map((s) => (
              <div key={s.label} className="text-center py-6 sm:py-10 px-2 sm:px-4">
                <p className="font-display text-2xl sm:text-3xl md:text-4xl text-coral">{s.value}</p>
                <p className="mt-1 text-xs sm:text-sm text-ink/60">{s.label}</p>
              </div>
            ))}
          </section>
        </>
      )}

      <footer className="border-t border-ink/15 text-center text-sm text-ink/50 py-8 px-4">
        PalomponFacesmash — made for the town, by the town.
      </footer>

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSignIn={handleSignIn}
        />
      )}

      {showUploadModal && (
        <UploadPhotoModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handlePhotoUpload}
        />
      )}

      {matchPhotoId && matchLocalPreview && user && (
        <MatchFoundModal
          photoId={matchPhotoId}
          localPreview={matchLocalPreview}
          myUid={user.uid}
          onClose={() => {
            setMatchPhotoId(null);
            setMatchLocalPreview(null);
          }}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}