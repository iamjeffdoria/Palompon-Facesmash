import { memo, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import type { ChatMessage } from "../hooks/useLiveChat";
import { timeAgo } from "../lib/timeAgo";
interface Props {
  message: ChatMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
  deleting: boolean;
}
function ChatMessageRow({ message: m, isOwn, onDelete, deleting }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex items-start gap-2.5 group">
      {m.photoURL ? (
        <img src={m.photoURL} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <span className="w-8 h-8 rounded-full bg-teal text-sand flex items-center justify-center text-xs font-medium shrink-0">
          {m.name?.[0] ?? "?"}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-xs font-medium truncate">{m.name}</p>
          <p className="text-[10px] text-ink/40 shrink-0">{timeAgo(m.createdAt)}</p>
          {isOwn && (
            <div className="relative ml-auto shrink-0">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Message options"
                className={`text-ink/40 hover:text-ink transition-colors p-1 -m-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${
                  menuOpen ? "sm:opacity-100" : ""
                }`}
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-sand border border-ink/15 shadow-lg z-20 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(m.id);
                      }}
                      disabled={deleting}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-coral hover:bg-coral/10 transition-colors disabled:opacity-40 w-full text-left"
                    >
                      {deleting ? (
                        <span className="w-3 h-3 border-2 border-coral/30 border-t-coral rounded-full animate-spin shrink-0" />
                      ) : (
                        <Trash2 size={13} className="shrink-0" />
                      )}
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-ink/80 break-words">{m.text}</p>
      </div>
    </div>
  );
}
export default memo(ChatMessageRow);