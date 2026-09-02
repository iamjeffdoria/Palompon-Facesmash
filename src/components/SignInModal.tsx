import { useState } from "react";

export default function SignInModal({
  onClose,
  onSignIn,
}: {
  onClose: () => void;
  onSignIn: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      await onSignIn();
      onClose();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const isUserCancelled =
        code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request";

      if (!isUserCancelled) {
        if (code === "auth/popup-blocked") {
          setError("Your browser blocked the sign-in popup. Allow popups for this site and try again.");
        } else if (code === "auth/network-request-failed") {
          setError("No connection — check your internet and try again.");
        } else {
          setError("Sign-in didn't go through. Try again.");
        }
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/50 flex items-center justify-center px-6 z-50"
      onClick={onClose}
    >
      <div
        className="bg-sand max-w-sm w-full p-8 border border-ink/15"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-ink/50 mb-2">One vote per person</p>
        <h3 className="font-display text-2xl mb-3">Sign in to vote</h3>
        <p className="text-sm text-ink/70 mb-6">
          We use Google sign-in to keep voting fair, one account, one vote per matchup.
        </p>
        <button
          onClick={handleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-ink/20 py-3 font-medium hover:border-ink transition-colors mb-3 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.96H.96A8.996 8.996 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.34z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
        {error && <p className="text-xs text-coral mb-3">{error}</p>}
        <button
          onClick={onClose}
          className="w-full text-sm text-ink/50 hover:text-ink py-2 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}