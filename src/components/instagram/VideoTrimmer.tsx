import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { getSafeVideoSrc } from "@/lib/instagram/media";

function stamp(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${m}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

/** Timeline filmstrip cutter with draggable start/end handles. */
export function VideoTrimmer({
  src,
  onCancel,
  onSave,
}: {
  src: string;
  onCancel: () => void;
  onSave: (start: number, end: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const dragRef = useRef<"start" | "end" | null>(null);

  useEffect(() => {
    const move = (clientX: number) => {
      const el = trackRef.current;
      const handle = dragRef.current;
      if (!el || !handle || !duration) return;
      const rect = el.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const t = pct * duration;
      if (handle === "start") setStart(Math.min(t, end - 0.2));
      else setEnd(Math.max(t, start + 0.2));
      if (videoRef.current) videoRef.current.currentTime = t;
    };
    const onMouse = (e: MouseEvent) => move(e.clientX);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) move(t.clientX);
    };
    const stop = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, [duration, start, end]);

  const onLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
    setStart(0);
    setEnd(v.duration || 0);
  };

  const onTime = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.currentTime > end) {
      v.currentTime = start;
    }
    setCurrent(v.currentTime);
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < start || v.currentTime > end) v.currentTime = start;
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const pct = (t: number) => (duration ? (t / duration) * 100 : 0);

  return (
    <div className="fixed inset-0 z-[1010] bg-black flex flex-col">
      <div className="flex items-center justify-between px-5 py-3">
        <button onClick={onCancel} className="text-sm font-semibold text-white">
          Cancel
        </button>
        <h3 className="text-sm font-semibold text-white">Trim feels</h3>
        <button
          onClick={() => onSave(start, end)}
          className="text-sm font-bold text-pink-500"
          type="button"
        >
          Save
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            playsInline
            className="max-h-full max-w-full"
            onLoadedMetadata={onLoaded}
            onTimeUpdate={onTime}
            onError={(e) => {
              e.preventDefault();
            }}
            onClick={toggle}
          />
        ) : null}
      </div>

      <div className="px-5 pb-8 pt-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>{stamp(start)}</span>
          <span className="text-white">{stamp(current)}</span>
          <span>{stamp(end)}</span>
        </div>

        <div
          ref={trackRef}
          className="relative h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden select-none"
        >
          {/* Filmstrip */}
          <div className="absolute inset-0 flex">
            {src &&
              Array.from({ length: 5 }).map((_, i) => (
                <video
                  key={i}
                  src={getSafeVideoSrc(src)}
                  muted
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.display = "none";
                  }}
                  className="h-full flex-1 object-cover opacity-70"
                />
              ))}
          </div>
          {/* Dim outside the selection */}
          <div
            className="absolute inset-y-0 left-0 bg-black/60"
            style={{ width: `${pct(start)}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-black/60"
            style={{ width: `${100 - pct(end)}%` }}
          />
          {/* Selection frame */}
          <div
            className="absolute inset-y-0 border-y-2 border-pink-500 pointer-events-none"
            style={{ left: `${pct(start)}%`, right: `${100 - pct(end)}%` }}
          />
          {/* Playhead */}
          <div
            className="absolute inset-y-0 w-0.5 bg-white/80 pointer-events-none"
            style={{ left: `${pct(current)}%` }}
          />
          {/* Handles */}
          <button
            aria-label="Trim start"
            onMouseDown={() => (dragRef.current = "start")}
            onTouchStart={() => (dragRef.current = "start")}
            className="absolute top-0 bottom-0 w-4 -ml-2 bg-pink-500 rounded-l-md flex items-center justify-center"
            style={{ left: `${pct(start)}%` }}
          >
            <span className="w-0.5 h-5 bg-white/90 rounded-full" />
          </button>
          <button
            aria-label="Trim end"
            onMouseDown={() => (dragRef.current = "end")}
            onTouchStart={() => (dragRef.current = "end")}
            className="absolute top-0 bottom-0 w-4 -ml-2 bg-pink-500 rounded-r-md flex items-center justify-center"
            style={{ left: `${pct(end)}%` }}
          >
            <span className="w-0.5 h-5 bg-white/90 rounded-full" />
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={toggle}
            className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
