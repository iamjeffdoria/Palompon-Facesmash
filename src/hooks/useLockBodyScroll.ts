import { useEffect } from "react";

/**
 * Locks page scroll while `locked` is true (defaults to true, for modals that
 * are only ever mounted while open). Restores the previous overflow/padding
 * on unmount or when `locked` flips back to false. Compensates for the
 * scrollbar-width layout shift so content doesn't jump when scroll locks.
 */
export function useLockBodyScroll(locked: boolean = true) {
  useEffect(() => {
    if (!locked) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [locked]);
}