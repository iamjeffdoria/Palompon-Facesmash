import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useActiveMatches } from "../hooks/useActiveMatches";
import { useNotifications } from "../hooks/useNotifications";
import { useStreak } from "../hooks/useStreak";
import { useProfile } from "../hooks/useProfile";
import { castVote } from "../lib/vote";
import { useAuth } from "../hooks/useAuth";
import { auth, db } from "../lib/firebase";
import SiteHeader from "../components/SiteHeader";
import MatchupBoard from "../components/MatchupBoard";
import LeaderboardCard from "../components/LeaderboardCard";
import MarketingSections from "../components/MarketingSections";
import SignInModal from "../components/SignInModal";
import UploadPhotoModal from "../components/UploadPhotoModal";
import MatchFoundModal from "../components/MatchFoundModal";
import SmashOrPassDeck from "../components/SmashOrPassDeck";
import EditProfileModal from "../components/EditProfileModal";
import Toast, { type ToastData } from "../components/Toast";
import { uploadPhotoAndQueue } from "../lib/uploadPhoto";

export default function Landing() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [matchPhotoId, setMatchPhotoId] = useState<string | null>(null);
  const [matchLocalPreview, setMatchLocalPreview] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<{ matchId: string; sideUid: string } | null>(null);
  const [pendingSmash, setPendingSmash] = useState<{ photoId: string; choice: "smash" | "pass" } | null>(null);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const { user, loading, signInWithGoogle, logOut } = useAuth();
  const { matches } = useActiveMatches();
  const { notifications } = useNotifications(user?.uid);
  const streak = useStreak(user?.uid);
  const { profile, displayName, displayPhotoURL, updateName } = useProfile(
    user?.uid,
    user?.displayName ?? null,
    user?.photoURL ?? null
  );
  const lastSeenNotifAt = useRef<number | null>(null);

  // Pop a toast the instant a new vote/smash notification arrives, even if
  // the bell panel is closed. On first load (or right after sign-in), we
  // just record the most recent timestamp without toasting — otherwise
  // every notification you already had would toast all at once.
  useEffect(() => {
    if (!user) {
      lastSeenNotifAt.current = null;
      return;
    }
    if (notifications.length === 0) return;
    const newestAt = notifications[0].createdAt;
    if (lastSeenNotifAt.current === null) {
      lastSeenNotifAt.current = newestAt;
      return;
    }
    const freshOnes = notifications.filter((n) => n.createdAt > lastSeenNotifAt.current!);
    if (freshOnes.length > 0) {
      const latest = freshOnes[0];
      setToast({
        message:
          latest.type === "smash"
            ? `🔥 ${latest.actorName} smashed your photo!`
            : `${latest.actorName} voted for you!`,
        type: "success",
      });
      lastSeenNotifAt.current = newestAt;
    }
  }, [notifications, user]);

  async function handleVoteClick(matchId: string, sideUid: string) {
    if (!user) {
      setPendingVote({ matchId, sideUid });
      setShowSignIn(true);
      return;
    }
    setVotingFor(`${matchId}:${sideUid}`);
    try {
      await castVote(matchId, user.uid, sideUid, {
        name: displayName,
        photoURL: displayPhotoURL,
      });
    } catch (err) {
      console.error(err);
      setToast({ message: "Vote didn't go through. Try again.", type: "info" });
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
      castVote(pendingVote.matchId, freshUid, pendingVote.sideUid, {
        name: auth.currentUser?.displayName ?? "Someone",
        photoURL: auth.currentUser?.photoURL ?? null,
      }).catch(console.error);
      setPendingVote(null);
    }

    // pendingSmash is intentionally NOT resolved here — SmashOrPassDeck
    // resumes it itself once myUid becomes truthy, since it already has
    // the deck data (photo owner's uid) needed to complete the smash.

    if (pendingUpload) {
      setPendingUpload(false);
      setShowUploadModal(true);
    }

    // First-ever sign-in (or anyone who's never set a custom name): prompt
    // them to confirm/edit their name before it gets baked into votes and
    // photos. We check the just-fetched profile doc directly rather than
    // the `profile` state variable, since the onSnapshot listener may not
    // have delivered yet at this point.
    if (freshUid) {
      const snap = await getDoc(doc(db, "users", freshUid));
      const hasCustomName = snap.exists() && !!snap.data()?.firstName;
      if (!hasCustomName) {
        setShowEditProfile(true);
      }
    }
  }

  function handleLogOut() {
    logOut();
    setToast({ message: "Signed out — see you around!", type: "info" });
  }

  async function handlePhotoUpload(
    file: File,
    destination: "match" | "smash" | "both",
    barangay: string
  ) {
    if (!user) return;
    if (destination === "match" || destination === "both") {
      setMatchLocalPreview(URL.createObjectURL(file));
    }
    const { photoId } = await uploadPhotoAndQueue(
      file,
      { uid: user.uid, displayName },
      destination,
      barangay
    );
    if (photoId) {
      setMatchPhotoId(photoId);
    } else {
      setToast({ message: "Added to Smash or Pass!", type: "success" });
    }
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-sand text-ink font-body">
      <SiteHeader
        user={user}
        displayName={displayName}
        photoURL={displayPhotoURL}
        loading={loading}
        streak={streak}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
        onShowSignIn={() => setShowSignIn(true)}
        onShowUpload={() => setShowUploadModal(true)}
        onLogOut={handleLogOut}
        onEditProfile={() => setShowEditProfile(true)}
      />

      {showBanner && !loading && !user && (
        <div className="bg-mango/20 border-b border-ink/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
            <p className="text-sm md:text-base font-display italic">Whose facecard never declines?</p>
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8 grid md:grid-cols-2 gap-8 md:gap-10 items-start">
        <MatchupBoard
          matches={matches}
          hasUser={!!user}
          onVote={handleVoteClick}
          votingFor={votingFor}
          onShowUpload={() => setShowUploadModal(true)}
          myUid={user?.uid}
        />
        <LeaderboardCard />
      </section>

      <SmashOrPassDeck
        myUid={user?.uid}
        myName={user ? displayName : null}
        myPhotoURL={user ? displayPhotoURL : null}
        pendingSmash={pendingSmash}
        onRequireSignIn={(photoId, choice) => {
          setPendingSmash({ photoId, choice });
          setShowSignIn(true);
        }}
        onPendingSmashResolved={() => setPendingSmash(null)}
        onVoteError={() => setToast({ message: "That didn't go through. Try again.", type: "info" })}
      />

      {!user && <MarketingSections />}

      <footer className="border-t border-ink/15 text-center text-sm text-ink/50 py-8 px-4">
        PalomponFacesmash — made for the town, by the town.
      </footer>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onSignIn={handleSignIn} />}

      {showUploadModal && (
        <UploadPhotoModal onClose={() => setShowUploadModal(false)} onUpload={handlePhotoUpload} />
      )}

      {showEditProfile && user && (
        <EditProfileModal
          initialFirstName={profile?.firstName ?? user.displayName?.split(" ")[0] ?? ""}
          initialLastName={profile?.lastName ?? user.displayName?.split(" ").slice(1).join(" ") ?? ""}
          initialPhotoURL={displayPhotoURL}
          onClose={() => setShowEditProfile(false)}
          onSave={async (firstName, lastName, photoURL) => {
            await updateName(firstName, lastName, photoURL);
            setToast({ message: "Profile updated!", type: "success" });
          }}
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