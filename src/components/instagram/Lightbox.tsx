import { useCallback, useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { DEFAULT_AVATAR } from "@/lib/instagram/data";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function Lightbox() {
  const { lightbox, closeLightbox, isGlobalMuted, toggleGlobalMute } = useApp();
  useBodyScrollLock(lightbox.open);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Zoom / pan transform for the image viewer.
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; zoom: number; cx: number; cy: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const lastTapRef = useRef(0);

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
  }, [lightbox.mediaUrl, lightbox.open, reset]);

  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    // Pause background videos while lightbox is open
    const paused: HTMLVideoElement[] = [];
    document.querySelectorAll("video").forEach((v) => {
      if (v !== videoRef.current && !v.paused) {
        v.pause();
        paused.push(v);
      }
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      // Resume previously-playing background videos on close
      paused.forEach((v) => v.play().catch(() => undefined));
    };
  }, [lightbox.open, closeLightbox]);

  // Anchored zoom helper — keeps the point under the finger/cursor stationary.
  const zoomTo = useCallback((next: number, px: number, py: number) => {
    setZoom((prev) => {
      const clamped = clamp(next, MIN_ZOOM, MAX_ZOOM);
      const k = clamped / prev;
      setOffset((o) =>
        clamped === MIN_ZOOM ? { x: 0, y: 0 } : { x: px - (px - o.x) * k, y: py - (py - o.y) * k },
      );
      return clamped;
    });
  }, []);

  // Non-passive wheel/pinch handler.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || lightbox.mediaType !== "image") return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      setZoom((prev) => {
        const nextZoom = clamp(prev * Math.exp(-dy * 0.002), MIN_ZOOM, MAX_ZOOM);
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const k = nextZoom / prev;
        setOffset((o) =>
          nextZoom === MIN_ZOOM
            ? { x: 0, y: 0 }
            : { x: px - (px - o.x) * k, y: py - (py - o.y) * k },
        );
        return nextZoom;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [lightbox.mediaType, lightbox.open]);

  if (!lightbox.open) return null;

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const localPoint = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (a && b) {
        const p = localPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
        pinchRef.current = {
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          zoom,
          cx: p.x,
          cy: p.y,
        };
      }
      panRef.current = null;
    } else if (zoom > 1) {
      panRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pinch = pinchRef.current;
    if (pinch && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomTo((pinch.zoom * dist) / (pinch.dist || 1), pinch.cx, pinch.cy);
      return;
    }
    const pan = panRef.current;
    if (pan && zoom > 1) {
      setOffset({ x: pan.ox + (e.clientX - pan.x), y: pan.oy + (e.clientY - pan.y) });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) panRef.current = null;
  };

  const onImageTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const p = localPoint(e.clientX, e.clientY);
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      if (zoom > 1) reset();
      else zoomTo(2.5, p.x, p.y);
      return;
    }
    lastTapRef.current = now;
    // Single tap on the image while zoomed out closes the viewer.
    window.setTimeout(() => {
      if (lastTapRef.current === now && zoom === 1) closeLightbox();
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
      onClick={closeLightbox}
    >
      {/* Only show mute toggle for video media */}
      {lightbox.mediaType === "video" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleGlobalMute();
          }}
          className="absolute top-4 left-4 p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-full text-white z-10"
          aria-label="Toggle sound"
        >
          {isGlobalMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}
      <button
        onClick={closeLightbox}
        className="absolute top-4 right-4 p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-full text-white z-10 shadow-lg border border-white/10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div
        className="relative max-w-4xl w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={stageRef}
          className="relative bg-transparent rounded-2xl overflow-hidden max-h-[90vh] flex items-center justify-center"
          style={{ touchAction: lightbox.mediaType === "image" ? "none" : undefined }}
        >
          {lightbox.mediaType === "image" ? (
            lightbox.mediaUrl ? (
              <img
                src={lightbox.mediaUrl}
                alt={lightbox.caption ?? ""}
                draggable={false}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onClick={onImageTap}
                className="max-h-[85vh] w-auto max-w-full object-contain select-none rounded-xl shadow-2xl"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                  transition:
                    pinchRef.current || panRef.current ? "none" : "transform 180ms ease-out",
                  cursor: zoom > 1 ? "grab" : "zoom-in",
                }}
              />
            ) : null
          ) : lightbox.mediaUrl ? (
            <video
              ref={videoRef}
              src={lightbox.mediaUrl}
              controls={false}
              autoPlay
              playsInline
              preload="auto"
              muted={isGlobalMuted}
              className="transform-gpu translate-z-0 will-change-transform max-h-[85vh] w-auto max-w-full rounded-xl"
              style={{ transform: "translateZ(0)" }}
              onTimeUpdate={onTimeUpdate}
              onError={(e) => {
                e.preventDefault();
              }}
              onClick={(e) => {
                const v = e.currentTarget;
                if (v.paused) v.play();
                else v.pause();
              }}
            />
          ) : null}

          {/* Bottom overlay: author + caption ONLY for video */}
          {lightbox.mediaType === "video" && zoom === 1 && (
            <div className="absolute left-0 right-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-black/80 to-transparent text-white space-y-2 pointer-events-none">
              <div className="flex items-center gap-2.5">
                <img
                  src={lightbox.authorAvatar || DEFAULT_AVATAR}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-500/50"
                  alt={lightbox.authorName}
                />
                <span className="text-sm font-semibold text-slate-100">{lightbox.authorName}</span>
              </div>
              {lightbox.caption && (
                <p className="text-sm text-slate-100 leading-relaxed line-clamp-3">
                  {lightbox.caption}
                </p>
              )}
            </div>
          )}

          {/* Video seek bar */}
          {lightbox.mediaType === "video" && (
            <div
              onClick={seek}
              className="absolute left-0 right-0 bottom-0 h-1.5 bg-white/20 cursor-pointer overflow-hidden"
            >
              <div
                className="h-full bg-white transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
