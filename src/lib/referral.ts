import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const REF_STORAGE_KEY = "pendingReferrerUid";

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    sessionStorage.setItem(REF_STORAGE_KEY, ref);
  }
}

export function getPendingReferrer(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REF_STORAGE_KEY);
}

export function clearPendingReferrer() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REF_STORAGE_KEY);
}

export function buildInviteLink(uid: string): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("ref", uid);
  return url.toString();
}

export async function recordReferral(referredUid: string, referrerUid: string) {
  if (referredUid === referrerUid) return;
  // Doc id == referredUid, so this is naturally a one-shot: once it exists,
  // Firestore treats further calls as updates, which the rules block.
  await setDoc(doc(db, "referrals", referredUid), {
    referrerUid,
    referredUid,
    createdAt: Date.now(),
  });
}