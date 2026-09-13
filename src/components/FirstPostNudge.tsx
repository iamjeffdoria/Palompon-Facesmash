import { useState } from "react";
import { Camera, X } from "lucide-react";

export default function FirstPostNudge({ onPost }: { onPost: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-teal/10 border-b border-teal/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-ink/80">
          <span className="font-medium text-teal">Psst</span> — you haven't posted yet. Smash or Pass entries can be deleted anytime, so there's zero pressure.
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onPost}
            className="flex items-center gap-1.5 bg-teal text-sand px-3 py-1.5 text-xs font-medium hover:bg-ink transition-colors"
          >
            <Camera size={13} />
            Post now
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="text-ink/40 hover:text-ink transition-colors p-1.5"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}