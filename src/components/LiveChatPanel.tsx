import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useLiveChat } from "../hooks/useLiveChat";
import { sendChatMessage } from "../lib/chat";
import { timeAgo } from "../lib/timeAgo";
export default function LiveChatPanel({
  myUid,
  myName,
  myPhotoURL,
  onRequireSignIn,
}: {
  myUid: string | undefined;
  myName: string | null;
  myPhotoURL: string | null;
  onRequireSignIn: () => void;
}) {
  const { messages, loading } = useLiveChat();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  async function handleSend() {
    if (!myUid) {
      onRequireSignIn();
      return;
    }
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      await sendChatMessage({ uid: myUid, name: myName ?? "Someone", photoURL: myPhotoURL }, text);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={16} className="text-coral" />
        <span className="text-xs tracking-wide text-coral font-medium">Town Chat</span>
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-ink/40 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
          live
        </span>
      </div>
      <div className="border border-ink/15 bg-sand flex flex-col h-80 sm:h-96 max-h-[65vh] sm:max-h-[60vh]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {loading ? (
            <p className="text-center text-sm text-ink/40 py-10">Loading chat...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-ink/40 py-10">No messages yet — say hi!</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5">
                {m.photoURL ? (
                  <img src={m.photoURL} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-teal text-sand flex items-center justify-center text-xs font-medium shrink-0">
                    {m.name?.[0] ?? "?"}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-ink/40 shrink-0">{timeAgo(m.createdAt)}</p>
                  </div>
                  <p className="text-sm text-ink/80 break-words">{m.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-ink/15 p-3 flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!myUid) onRequireSignIn();
            }}
            placeholder={myUid ? "Say something to the town..." : "Sign in to join the chat"}
            maxLength={300}
            className="flex-1 min-w-0 border border-ink/20 bg-sand px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:border-coral transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="bg-coral text-sand p-2.5 hover:bg-ink transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}