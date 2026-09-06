import { useState } from "react";
import { Flame } from "lucide-react";
import type { User } from "firebase/auth";

export default function AccountMenu({
  user,
  streak,
  onSignOut,
}: {
  user: User;
  streak: number | null;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm hover:text-coral transition-colors"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <span className="w-7 h-7 rounded-full bg-teal text-sand flex items-center justify-center text-xs font-medium">
            {user.displayName?.[0] ?? "U"}
          </span>
        )}
        <span className="hidden sm:inline">{user.displayName?.split(" ")[0]}</span>
        {streak !== null && streak > 0 && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-coral">
            <Flame size={12} />
            {streak}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 bg-sand border border-ink/15 z-50">
            <div className="px-4 py-3 border-b border-ink/10">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-ink/50 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-ink/5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}