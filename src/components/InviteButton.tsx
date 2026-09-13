import { Share2, Users } from "lucide-react";
import { buildInviteLink } from "../lib/referral";
import { useReferralCount } from "../hooks/useReferralCount";

export default function InviteButton({
  uid,
  onShared,
  variant = "menu",
}: {
  uid: string;
  onShared?: () => void;
  variant?: "menu" | "pill";
}) {
  const referralCount = useReferralCount(uid);

  function handleInvite() {
    const link = buildInviteLink(uid);
    const text = "Palompon's voting for its champion — come pick a side (or post your own face) 👀";
    if (navigator.share) {
      navigator.share({ title: text, url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${link}`);
    }
    onShared?.();
  }

  if (variant === "pill") {
    return (
      <button
        onClick={handleInvite}
        className="w-full flex items-center justify-center gap-1.5 border border-teal text-teal px-3 py-1.5 hover:bg-teal hover:text-sand transition-colors"
      >
        <Share2 size={15} />
        Invite friends
        {referralCount > 0 && <span className="text-xs font-semibold ml-1">({referralCount})</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleInvite}
      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm hover:bg-ink/5 transition-colors"
    >
      <Share2 size={14} />
      <span className="flex-1">Invite friends</span>
      {referralCount > 0 && (
        <span className="flex items-center gap-1 text-xs text-teal font-medium">
          <Users size={11} />
          {referralCount}
        </span>
      )}
    </button>
  );
}