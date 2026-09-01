import { Menu, Camera } from "lucide-react";
import type { User } from "firebase/auth";
import AccountMenu from "./AccountMenu";
import FeaturedProfileModal from "./FeaturedProfileModal";
import NotificationBell from "./NotificationBell";

export default function SiteHeader({
  user,
  loading,
  mobileMenuOpen,
  onToggleMobileMenu,
  onShowSignIn,
  onShowUpload,
  onLogOut,
}: {
  user: User | null;
  loading: boolean;
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
                  <AccountMenu user={user} onSignOut={onLogOut} />
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

        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle menu"
          className="md:hidden p-2"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
      </div>

      {!user && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pb-3 -mt-1">
          <p className="text-xs sm:text-sm text-ink/60">
            Post your photo, go head-to-head or get swiped on, and let Palompon vote for its champion.
          </p>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-ink/15 px-4 sm:px-6 py-4 flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between">
            <FeaturedProfileModal />
            {user && <NotificationBell uid={user.uid} />}
          </div>
          {!loading && (
            <>
              {!user && (
                <>
                  <a href="#how" onClick={onToggleMobileMenu} className="hover:text-coral transition-colors">
                    How it works
                  </a>
                  <a href="#board" onClick={onToggleMobileMenu} className="hover:text-coral transition-colors">
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
                      onToggleMobileMenu();
                      onLogOut();
                    }}
                    className="text-xs text-coral hover:text-ink transition-colors shrink-0"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onToggleMobileMenu();
                    onShowSignIn();
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
  );
}