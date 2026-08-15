import { useEffect, useRef, useState } from "react";

/**
 * Hook to automatically hide/show top tabs and bottom navigation on scroll.
 * - Scrolling DOWN: slides top tabs UP (-translate-y-full) and bottom nav DOWN (translate-y-full)
 * - Scrolling UP: restores both back to view (translate-y-0)
 */
export function useAutoHideOnScroll(containerRef: React.RefObject<HTMLElement | null>) {
  const [isTabsHidden, setIsTabsHidden] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const nav = document.getElementById("bottom-nav");

    const showAll = () => {
      setIsTabsHidden(false);
      nav?.classList.remove("translate-y-full");
    };

    const hideAll = () => {
      setIsTabsHidden(true);
      nav?.classList.add("translate-y-full");
    };

    // Ensure initially visible
    showAll();
    lastYRef.current = el.scrollTop;

    const handleScroll = () => {
      const currentY = el.scrollTop;
      const dy = currentY - lastYRef.current;

      // Ignore jitter / micro-scrolls
      if (Math.abs(dy) < 6) return;

      if (currentY <= 15) {
        showAll();
      } else if (dy > 0 && currentY > 40) {
        // Scrolling DOWN -> Hide top tabs & bottom nav
        hideAll();
      } else if (dy < 0) {
        // Scrolling UP -> Reveal top tabs & bottom nav
        showAll();
      }

      lastYRef.current = currentY;
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", handleScroll);
      // Clean up by restoring visibility on navigation or unmount
      showAll();
    };
  }, [containerRef]);

  return { isTabsHidden };
}
