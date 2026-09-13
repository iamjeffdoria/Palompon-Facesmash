import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useLiveChat } from "../hooks/useLiveChat";
import { sendChatMessage, deleteChatMessage } from "../lib/chat";
import ChatMessageRow from "./ChatMessageRow";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useUserProfiles } from "../hooks/useUserProfiles";

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
  const messageUids = useMemo(() => messages.map((m) => m.uid), [messages]);
  const profiles = useUserProfiles(messageUids);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  useLockBodyScroll(mobileModalOpen);
  const lastSentAtRef = useRef(0);
  const SEND_COOLDOWN_MS = 1500;
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = desktopScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!mobileModalOpen) return;
    const el = mobileScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, mobileModalOpen]);

  async function handleSend() {
    if (!myUid) {
      onRequireSignIn();
      return;
    }
    const text = draft.trim();
    if (!text || sending) return;
    const now = Date.now();
    if (now - lastSentAtRef.current < SEND_COOLDOWN_MS) return;
    lastSentAtRef.current = now;
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

  async function handleDelete(messageId: string) {
    if (deletingId) return;
    setDeletingId(messageId);
    try {
      await deleteChatMessage(messageId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  function renderMessageList(listRef: React.RefObject<HTMLDivElement | null>) {
    return (
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-sm text-ink/40 py-10">Loading chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-ink/40 py-10">No messages yet — say hi!</p>
        ) : (
          messages.map((m) => (
            <ChatMessageRow
              key={m.id}
              message={m}
              isOwn={myUid === m.uid}
              onDelete={handleDelete}
              deleting={deletingId === m.id}
              profile={profiles[m.uid]}
            />
          ))
        )}
      </div>
    );
  }

  function renderInput() {
    return (
      <div className="border-t border-ink/15 p-3 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            if (!myUid) return;
            setDraft(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!myUid) onRequireSignIn();
          }}
          onClick={() => {
            if (!myUid) onRequireSignIn();
          }}
          readOnly={!myUid}
          placeholder={myUid ? "Say something to the town..." : "Sign in to join the chat"}
          maxLength={300}
          className={`flex-1 min-w-0 border border-ink/20 bg-sand px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:border-coral transition-colors ${
            !myUid ? "cursor-pointer" : ""
          }`}
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
    );
  }

  return (
    <>
      {/* Desktop: inline panel, sits in the grid next to Smash or Pass */}
      <div className="hidden md:block min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={16} className="text-coral" />
          <span className="text-xs tracking-wide text-coral font-medium">Town Chat</span>
          <span className="flex items-center gap-1.5 text-xs text-ink/40 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
            live
          </span>
        </div>
        <div className="border border-ink/15 bg-sand flex flex-col h-96 max-h-[60vh]">
          {renderMessageList(desktopScrollRef)}
          {renderInput()}
        </div>
      </div>

      {/* Mobile: floating action button that opens a full-screen chat modal */}
      <button
        type="button"
        onClick={() => setMobileModalOpen(true)}
        aria-label="Open Town Chat"
        className="md:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-coral text-sand pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-ink transition-colors"
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium">Chat</span>
      </button>

      {mobileModalOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-sand flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink/15 shrink-0">
            <span className="flex items-center gap-2 min-w-0">
              <MessageCircle size={16} className="text-coral shrink-0" />
              <span className="font-display italic text-lg truncate">Town Chat</span>
              <span className="flex items-center gap-1.5 text-xs text-ink/40 ml-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
                live
              </span>
            </span>
            <button
              onClick={() => setMobileModalOpen(false)}
              aria-label="Close chat"
              className="text-ink/50 hover:text-ink transition-colors p-1 shrink-0"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            {renderMessageList(mobileScrollRef)}
            {renderInput()}
          </div>
        </div>
      )}
    </>
  );
}