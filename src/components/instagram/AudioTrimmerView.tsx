import { useEffect, useMemo, useRef, useState } from "react";
import { Music2, Pause, Play, X } from "lucide-react";
import { formatSeconds, type AudioTrack } from "@/lib/instagram/audioLibrary";

/**
 * Full-screen Instagram-style audio editor: cover art, title/artist, Done,
 * and a scrubbable waveform timeline for picking the clip segment.
 */
export function AudioTrimmerView({
  track,
  playing,
  duration,
  current,
  clipLength = 15,
  onTogglePlay,
  onSeek,
  onClose,
  onDone,
}: {
  track: AudioTrack;
  playing: boolean;
  duration: number;
  current: number;
  clipLength?: number;
  onTogglePlay: () => void;
  onSeek: (s: number) => void;
  onClose: () => void;
  onDone: (startAt: number) => void;
}) {
  const total = duration > 0 ? duration : 60;
  const [start, setStart] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Deterministic pseudo-waveform per track.
  const bars = useMemo(() => {
    let seed = String(track.id)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: 64 }, () => {
      seed = (seed * 9301 + 49297) % 233280;
      return 25 + (seed / 233280) * 75;
    });
  }, [track.id]);

  useEffect(() => {
    if (current < start || current > start + clipLength + 1) return;
  }, [current, start, clipLength]);

  const setFromClientX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const maxStart = Math.max(0, total - clipLength);
    const next = Math.min(maxStart, ratio * total);
    setStart(next);
    onSeek(next);
  };

  const windowPct = Math.min(100, (clipLength / total) * 100);
  const startPct = (start / total) * 100;
  const playheadPct = Math.min(100, (current / total) * 100);

  return (
    <div className="fixed inset-0 z-[1100] h-[100dvh] bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onClose} aria-label="Close audio editor">
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold">Edit sound</span>
        <button onClick={() => onDone(start)} className="text-sm font-bold text-pink-500 px-2 py-1">
          Done
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="w-52 h-52 rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center shadow-2xl">
          {track.cover ? (
            <img src={track.cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music2 className="w-12 h-12 text-zinc-600" />
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold line-clamp-2">{track.title}</h2>
          <p className="text-sm text-zinc-400">{track.artist}</p>
        </div>
        <button
          onClick={onTogglePlay}
          className="w-14 h-14 rounded-full bg-pink-600 flex items-center justify-center"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
      </div>

      <div className="px-5 pb-10 space-y-3">
        <p className="text-sm font-semibold">Choose the part you want for your reel</p>
        <div
          ref={barRef}
          className="relative h-20 rounded-xl bg-zinc-900 overflow-hidden touch-none select-none"
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setFromClientX(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <div className="absolute inset-0 flex items-center gap-[2px] px-1">
            {bars.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-zinc-700"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div
            className="absolute top-0 bottom-0 border-2 border-pink-500 rounded-xl bg-pink-500/20 pointer-events-none"
            style={{ left: `${startPct}%`, width: `${windowPct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
            style={{ left: `${playheadPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
          <span>{formatSeconds(start)}</span>
          <span>
            {clipLength}s clip • {formatSeconds(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
