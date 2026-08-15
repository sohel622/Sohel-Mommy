import { useRef, useCallback } from "react";

/**
 * Touch-and-hold (400ms) gesture that co-exists with a normal single tap.
 * Fires `onLongPress` after the threshold, otherwise `onTap` on release.
 */
export function useLongPress(onLongPress: () => void, onTap?: () => void, ms = 400) {
  const timer = useRef<number | null>(null);
  const fired = useRef(false);
  const moved = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const start = useCallback(() => {
    fired.current = false;
    moved.current = false;
    clear();
    timer.current = window.setTimeout(() => {
      fired.current = true;
      onLongPress();
    }, ms);
  }, [clear, ms, onLongPress]);

  const end = useCallback(() => {
    clear();
    if (!fired.current && !moved.current) onTap?.();
  }, [clear, onTap]);

  const cancel = useCallback(() => {
    moved.current = true;
    clear();
  }, [clear]);

  return {
    onTouchStart: start,
    onTouchEnd: (e: React.TouchEvent) => {
      if (fired.current) e.preventDefault();
      end();
    },
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}
