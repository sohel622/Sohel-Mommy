import { useEffect } from "react";

let activeLockCount = 0;
let originalOverflow = "";
let originalTouchAction = "";
let originalHtmlOverflow = "";
let originalHtmlTouchAction = "";

function preventTouchMove(e: TouchEvent) {
  // If touch is within a scrollable modal container, allow internal scrolling
  const target = e.target as HTMLElement | null;
  if (target && target.closest("[data-modal-scrollable='true']")) {
    return;
  }
  // Otherwise freeze all background scrolling and gestures
  if (e.cancelable) {
    e.preventDefault();
  }
}

/**
 * Hook to strictly lock body, html, and background scrolling when a modal, drawer, or bottom sheet is open.
 * Prevents background leaking, bounce, and unwanted touch gestures on underlying views.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    if (activeLockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalTouchAction = document.body.style.touchAction;
      originalHtmlOverflow = document.documentElement.style.overflow;
      originalHtmlTouchAction = document.documentElement.style.touchAction;

      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.touchAction = "none";

      window.addEventListener("touchmove", preventTouchMove, { passive: false });
    }
    activeLockCount++;

    return () => {
      activeLockCount--;
      if (activeLockCount <= 0) {
        activeLockCount = 0;
        document.body.style.overflow = originalOverflow || "auto";
        document.body.style.touchAction = originalTouchAction || "auto";
        document.documentElement.style.overflow = originalHtmlOverflow || "auto";
        document.documentElement.style.touchAction = originalHtmlTouchAction || "auto";

        window.removeEventListener("touchmove", preventTouchMove);
      }
    };
  }, [isLocked]);
}
