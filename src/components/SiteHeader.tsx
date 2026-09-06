import { ChevronDown, ChevronUp, Camera, Flame } from "lucide-react";
import type { User } from "firebase/auth";
import AccountMenu from "./AccountMenu";
import FeaturedProfileModal from "./FeaturedProfileModal";
import NotificationBell from "./NotificationBell";

export default function SiteHeader({
  user,
  loading,
  streak,
  mobileMenuOpen,
  onToggleMobileMenu,
  onShowSignIn,
  onShowUpload,
  onLogOut,
}: {
  user: User | null;
  loading: boolean;
  streak: number | null;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onShowSignIn: () => void;
  onShowUpload: () => void;
  onLogOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-sand border-b border-ink/15">
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
              <FeaturedProfileModal />
              {user ? (
                <>
                  <button
                    onClick={onShowUpload}
                    className="flex items-center gap-1.5 border border-coral text-coral px-3 py-1.5 hover:bg-coral hover:text-sand transition-colors"
                  >
                    <Camera size={15} />
                    Post photo
                  </button>
                  <NotificationBell uid={user.uid} />
                  <AccountMenu user={user} streak={streak} onSignOut={onLogOut} />
                </>
              ) : (
                <button
                  onClick={onShowSignIn}
                  className="bg-ink text-sand px-4 py-2 hover:bg-coral transition-colors"
                >
                  Sign in
                </button>
              )}
            </>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-2">
          {!loading && user && (
            <span className="relative shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-teal text-sand flex items-center justify-center text-xs font-medium">
                  {user.displayName?.[0] ?? "U"}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal border-2 border-sand" />
            </span>
          )}
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle menu"
            className="p-2"
          >
            {mobileMenuOpen ? (
              <ChevronUp size={22} strokeWidth={2} />
            ) : (
              <ChevronDown size={22} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {!user && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pb-3 -mt-1">
          <p className="text-xs sm:text-sm text-ink/60">
            Post your photo, go head-to-head or get swiped on, and let Palompon vote for its champion.
          </p>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-ink/15 text-sm">
          {!loading && user && (
            <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-ink/10 bg-ink/[0.02]">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-11 h-11 rounded-full shrink-0" />
              ) : (
                <span className="w-11 h-11 rounded-full bg-teal text-sand flex items-center justify-center text-sm font-medium shrink-0">
                  {user.displayName?.[0] ?? "U"}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.displayName}</p>
                  {streak !== null && streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-coral shrink-0">
                      <Flame size={12} />
                      {streak}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink/50 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  onToggleMobileMenu();
                  onLogOut();
                }}
                className="text-xs text-coral hover:text-ink transition-colors shrink-0"
              >
                Sign out
              </button>
            </div>
          )}

          <div className="px-4 sm:px-6 py-4 flex flex-col gap-4">
            {!loading && user && (
              <div className="flex items-center justify-between gap-3">
                <FeaturedProfileModal />
                <NotificationBell uid={user.uid} />
              </div>
            )}

            {!loading && !user && (
              <>
                <div className="flex items-center justify-between">
                  <FeaturedProfileModal />
                </div>
                <a href="#how" onClick={onToggleMobileMenu} className="hover:text-coral transition-colors">
                  How it works
                </a>
                <a href="#board" onClick={onToggleMobileMenu} className="hover:text-coral transition-colors">
                  Leaderboard
                </a>
                <button
                  onClick={() => {
                    onToggleMobileMenu();
                    onShowSignIn();
                  }}
                  className="bg-ink text-sand px-4 py-2 hover:bg-coral transition-colors w-fit"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}