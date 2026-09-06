import { useState } from "react";
import { Flame, Pencil } from "lucide-react";
import type { User } from "firebase/auth";

export default function AccountMenu({
  user,
  displayName,
  photoURL,
  streak,
  onSignOut,
  onEditProfile,
}: {
  user: User;
  displayName: string;
  photoURL: string | null;
  streak: number | null;
  onSignOut: () => void;
  onEditProfile: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm hover:text-coral transition-colors"
      >
        {photoURL ? (
          <img src={photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <span className="w-7 h-7 rounded-full bg-teal text-sand flex items-center justify-center text-xs font-medium">
            {displayName?.[0] ?? "U"}
          </span>
        )}
        <span className="hidden sm:inline">{displayName?.split(" ")[0]}</span>
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
          <div className="absolute right-0 top-full mt-2 w-48 bg-sand border border-ink/15 z-50">
            <div className="px-4 py-3 border-b border-ink/10 flex items-center gap-2.5">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <span className="w-9 h-9 rounded-full bg-teal text-sand flex items-center justify-center text-sm font-medium shrink-0">
                  {displayName?.[0] ?? "U"}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-ink/50 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onEditProfile();
              }}
              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm hover:bg-ink/5 transition-colors"
            >
              <Pencil size={14} />
              Edit profile
            </button>
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