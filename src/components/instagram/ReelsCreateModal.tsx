import { useCallback, useEffect, useRef, useState } from "react";
import {
  Images,
  Mic,
  MicOff,
  Music2,
  RefreshCw,
  Scissors,
  Sliders,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
  Wand2,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { AudioPickerModal, type AudioTrack } from "./AudioPickerModal";
import {
  isValidYouTubeId,
  ytPause,
  ytPlay,
  ytProgress,
  ytResume,
  ytSeek,
  ytSetVolume,
  ytStop,
} from "@/lib/instagram/youtube";
import { mergeVideoAndAudio } from "@/lib/instagram/audioMixer";
import { getTrackAudioSrc } from "@/lib/instagram/audioLibrary";
import { getSafeVideoSrc } from "@/lib/instagram/media";
import { VideoTrimmer } from "./VideoTrimmer";
import { PostFeelsView } from "./PostFeelsView";
import { useApp } from "@/lib/instagram/context";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

export interface CameraFilterPreset {
  id: string;
  name: string;
  creator: string;
  css: string;
  thumbnailGradient: string;
  sampleImg: string;
  iconSymbol?: string;
  specialGlitch?: boolean;
}

export const CAMERA_FILTERS: CameraFilterPreset[] = [
  {
    id: "normal",
    name: "Normal",
    creator: "Instagram",
    css: "none",
    thumbnailGradient: "from-zinc-700 to-zinc-900",
    sampleImg:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "⭕",
  },
  {
    id: "iphone15pro",
    name: "iPhone 15Pro Max",
    creator: "By Creators",
    css: "contrast(1.15) brightness(1.05) saturate(1.25)",
    thumbnailGradient: "from-amber-400 via-rose-400 to-indigo-500",
    sampleImg:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "📱",
  },
  {
    id: "amber",
    name: "Amber Sunset",
    creator: "By Creators",
    css: "sepia(0.3) contrast(1.1) saturate(1.4) hue-rotate(-10deg)",
    thumbnailGradient: "from-amber-500 to-orange-600",
    sampleImg:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "🌅",
  },
  {
    id: "ultra8k",
    name: "8K Ultra HD",
    creator: "Ultra Clarity",
    css: "contrast(1.25) saturate(1.3) brightness(1.04)",
    thumbnailGradient: "from-cyan-400 to-blue-600",
    sampleImg:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "✨",
  },
  {
    id: "glitch",
    name: "Cyber Glitch",
    creator: "VaporWave Labs",
    css: "contrast(1.4) saturate(1.8) hue-rotate(45deg)",
    thumbnailGradient: "from-fuchsia-500 via-cyan-400 to-purple-600",
    sampleImg:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "⚡",
    specialGlitch: true,
  },
  {
    id: "beauty",
    name: "Beauty Plus",
    creator: "Glam Cam",
    css: "brightness(1.08) contrast(0.95) saturate(1.1)",
    thumbnailGradient: "from-pink-300 via-rose-300 to-amber-200",
    sampleImg:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "✨",
  },
  {
    id: "pearl",
    name: "Pearl Glow",
    creator: "Aesthetic Core",
    css: "contrast(1.1) brightness(1.12) saturate(1.2) sepia(0.08)",
    thumbnailGradient: "from-indigo-200 via-slate-100 to-rose-200",
    sampleImg:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "🦪",
  },
  {
    id: "dslr",
    name: "DSLR Pro",
    creator: "Canon Color Pro",
    css: "contrast(1.3) saturate(1.2) brightness(1.02)",
    thumbnailGradient: "from-emerald-400 to-teal-700",
    sampleImg:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "📷",
  },
  {
    id: "natural",
    name: "Natural Soft",
    creator: "Portrait Studio",
    css: "contrast(0.98) brightness(1.03) saturate(1.08)",
    thumbnailGradient: "from-amber-100 to-emerald-200",
    sampleImg:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "🌿",
  },
  {
    id: "vivid",
    name: "Vivid Saturation",
    creator: "Pop Art",
    css: "saturate(1.9) contrast(1.1) brightness(1.02)",
    thumbnailGradient: "from-yellow-400 via-red-500 to-pink-500",
    sampleImg:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "🎨",
  },
  {
    id: "sunset_sky",
    name: "Sunset Sky",
    creator: "GoldenHour",
    css: "sepia(0.4) saturate(1.6) hue-rotate(-15deg) contrast(1.15)",
    thumbnailGradient: "from-red-500 via-orange-400 to-yellow-300",
    sampleImg:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=180&q=80",
    iconSymbol: "🌆",
  },
];

const SPEEDS = [0.5, 1, 2, 3] as const;
const TIMERS = [0, 3, 10] as const;
const DURATIONS = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2m", value: 120 },
  { label: "3m", value: 180 },
];

export function ReelsCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { reels, posts } = useApp();
  useBodyScrollLock(open);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackAudioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<number | null>(null);
  const filterCanvasCleanupRef = useRef<(() => void) | null>(null);

  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [filter, setFilter] = useState<CameraFilterPreset>(CAMERA_FILTERS[0]!);
  const [speed, setSpeed] = useState<number>(1);
  const [timer, setTimer] = useState<number>(0);
  const [maxDuration, setMaxDuration] = useState(30);
  const [banner, setBanner] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<"videos" | "collections">("videos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [track, setTrack] = useState<AudioTrack | null>(null);

  // Audio Mixer Levels
  const [originalVol, setOriginalVol] = useState<number>(1.0);
  const [musicVol, setMusicVol] = useState<number>(0.8);

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<{ url: string; file?: File } | null>(null);
  const [mergedSelected, setMergedSelected] = useState<{ url: string; file?: File } | null>(null);
  const [trimming, setTrimming] = useState(false);
  const [posting, setPosting] = useState(false);

  const flash = useCallback((msg: string) => {
    setBanner(msg);
    window.setTimeout(() => setBanner(null), 1800);
  }, []);

  // Full-screen camera: hide app bottom nav
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("camera-active");
    const resumed: HTMLVideoElement[] = [];
    document.querySelectorAll("video").forEach((v) => {
      if (v !== videoRef.current && v !== previewVideoRef.current && !v.paused) {
        v.pause();
        resumed.push(v);
      }
    });
    return () => {
      root.classList.remove("camera-active");
      resumed.forEach((v) => void v.play().catch(() => undefined));
    };
  }, [open]);

  // WebRTC Camera Preview with non-telephony audio constraints
  useEffect(() => {
    if (!open || selected) return;
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false, // Smart mic: keep mic inactive until recording shutter is pressed!
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      } catch {
        // Camera unavailable fallback
      }
    };
    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, facing, selected]);

  // Synchronize camera voice & background music in real-time during preview
  useEffect(() => {
    if (!selected || !previewVideoRef.current) {
      if (trackAudioRef.current) {
        trackAudioRef.current.pause();
        trackAudioRef.current = null;
      }
      return;
    }

    const videoEl = previewVideoRef.current;

    // 1. Sync camera original voice volume instantly
    videoEl.volume = originalVol;
    videoEl.muted = originalVol === 0;

    // 2. Sync background music track if selected
    if (!track) {
      if (trackAudioRef.current) {
        trackAudioRef.current.pause();
        trackAudioRef.current = null;
      }
      void ytStop();
      return;
    }

    const isYt = Boolean(track.youtubeId && isValidYouTubeId(track.youtubeId));
    const audioSrc = getTrackAudioSrc(track);
    const startAt = track.startAt || 0;

    if (isYt) {
      if (trackAudioRef.current) {
        trackAudioRef.current.pause();
        trackAudioRef.current = null;
      }
      ytSetVolume(musicVol);
    } else {
      void ytStop();
      if (!trackAudioRef.current || trackAudioRef.current.src !== audioSrc) {
        if (trackAudioRef.current) trackAudioRef.current.pause();
        const a = new Audio();
        a.onerror = (e) => e.preventDefault();
        a.loop = true;
        a.crossOrigin = "anonymous";
        a.preload = "auto";
        a.src = audioSrc;
        trackAudioRef.current = a;
      }
      if (trackAudioRef.current) {
        trackAudioRef.current.volume = musicVol;
      }
    }

    const bgAudio = trackAudioRef.current;

    const handlePlay = () => {
      if (musicVol <= 0) {
        if (bgAudio) bgAudio.pause();
        if (isYt) ytPause();
        return;
      }
      const targetTime = videoEl.currentTime + startAt;
      if (isYt && track.youtubeId) {
        if (bgAudio) bgAudio.pause();
        ytSetVolume(musicVol);
        void ytPlay(track.youtubeId, targetTime, musicVol);
      } else if (bgAudio) {
        void ytStop();
        bgAudio.volume = musicVol;
        bgAudio.currentTime = targetTime;
        void bgAudio.play().catch(() => undefined);
      }
    };

    const handlePause = () => {
      if (bgAudio) bgAudio.pause();
      if (isYt) ytPause();
    };

    const handleSeek = () => {
      const targetTime = videoEl.currentTime + startAt;
      if (isYt) {
        ytSeek(targetTime);
      } else if (bgAudio) {
        bgAudio.currentTime = targetTime;
      }
    };

    const handleTimeUpdate = () => {
      if (videoEl.paused || musicVol <= 0) return;
      const targetTime = videoEl.currentTime + startAt;
      if (isYt) {
        const ytCur = ytProgress().current;
        if (ytCur > 0 && Math.abs(ytCur - targetTime) > 0.8) {
          ytSeek(targetTime);
        }
      } else if (bgAudio) {
        if (Math.abs(bgAudio.currentTime - targetTime) > 0.5) {
          bgAudio.currentTime = targetTime;
        }
      }
    };

    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("playing", handlePlay);
    videoEl.addEventListener("pause", handlePause);
    videoEl.addEventListener("seeking", handleSeek);
    videoEl.addEventListener("seeked", handleSeek);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);

    if (!videoEl.paused && musicVol > 0) {
      handlePlay();
    }

    return () => {
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("playing", handlePlay);
      videoEl.removeEventListener("pause", handlePause);
      videoEl.removeEventListener("seeking", handleSeek);
      videoEl.removeEventListener("seeked", handleSeek);
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [selected, track, originalVol, musicVol]);

  // Torch hardware control
  useEffect(() => {
    if (facing !== "environment") return;
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;
    try {
      void videoTrack.applyConstraints({
        advanced: [{ torch: flashOn } as MediaTrackConstraintSet],
      } as MediaTrackConstraints);
    } catch {
      /* Torch unsupported */
    }
  }, [flashOn, facing]);

  const galleryVideos = [
    ...reels.filter((r) => r.mediaUrl),
    ...posts.filter((p) => p.mediaType === "video"),
  ].slice(0, 18);

  const pickMedia = (url: string, file?: File) => {
    setGalleryOpen(false);
    setSelected({ url, file });
    setMergedSelected({ url, file });
  };

  const stopTrackAudio = () => {
    trackAudioRef.current?.pause();
    trackAudioRef.current = null;
    void ytStop();
  };

  const startTrackAudio = () => {
    if (!track) return;
    const audioSrc = getTrackAudioSrc(track);
    if (track.youtubeId) {
      void ytPlay(track.youtubeId, track.startAt ?? 0, musicVol);
    } else if (audioSrc) {
      const a = new Audio();
      a.onerror = (e) => e.preventDefault();
      a.volume = musicVol;
      a.src = audioSrc;
      a.currentTime = track.startAt ?? 0;
      trackAudioRef.current = a;
      void a.play().catch(() => undefined);
    }
  };

  const stopRecording = useCallback(() => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;
    setRecording(false);
    stopTrackAudio();

    if (filterCanvasCleanupRef.current) {
      filterCanvasCleanupRef.current();
      filterCanvasCleanupRef.current = null;
    }

    const rec = recorderRef.current;
    recorderRef.current = null;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const startRecording = async () => {
    try {
      // Smart Mic: request mic audio stream with non-telephony high-fidelity constraints
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 2,
          },
        });
      } catch {
        // Microphone permission denied or unattached
      }

      let recordedVideoTrack: MediaStreamTrack | null = null;
      const liveVideoEl = videoRef.current;

      // Bake live camera CSS/Canvas filter into recorded stream
      if (liveVideoEl && liveVideoEl.videoWidth > 0) {
        const canvas = document.createElement("canvas");
        const w = liveVideoEl.videoWidth || 720;
        const h = liveVideoEl.videoHeight || 1280;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        let animFrameId: number;
        const renderFilteredFrame = () => {
          if (ctx && liveVideoEl && !liveVideoEl.paused) {
            ctx.filter = filter.css !== "none" ? filter.css : "none";
            ctx.drawImage(liveVideoEl, 0, 0, w, h);

            if (filter.specialGlitch) {
              if (Math.random() > 0.5) {
                const sliceH = Math.floor(Math.random() * 25) + 8;
                const sliceY = Math.floor(Math.random() * (h - sliceH));
                const dx = (Math.random() - 0.5) * 35;
                ctx.drawImage(canvas, 0, sliceY, w, sliceH, dx, sliceY, w, sliceH);
              }
            }
          }
          animFrameId = requestAnimationFrame(renderFilteredFrame);
        };
        renderFilteredFrame();

        const canvasStream = canvas.captureStream(30);
        recordedVideoTrack = canvasStream.getVideoTracks()[0] || null;

        filterCanvasCleanupRef.current = () => {
          cancelAnimationFrame(animFrameId);
          canvasStream.getTracks().forEach((t) => t.stop());
        };
      } else {
        recordedVideoTrack = streamRef.current?.getVideoTracks()[0] || null;
      }

      const audioTracks = micStream ? micStream.getAudioTracks() : [];
      const combinedTracks = recordedVideoTrack
        ? [recordedVideoTrack, ...audioTracks]
        : audioTracks;

      if (combinedTracks.length === 0 || typeof MediaRecorder === "undefined") {
        startTrackAudio();
        fileInputRef.current?.click();
        return;
      }

      const recordStream = new MediaStream(combinedTracks);
      chunksRef.current = [];
      const rec = new MediaRecorder(recordStream);

      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        if (filterCanvasCleanupRef.current) {
          filterCanvasCleanupRef.current();
          filterCanvasCleanupRef.current = null;
        }
        audioTracks.forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];
        if (blob.size)
          pickMedia(
            URL.createObjectURL(blob),
            new File([blob], `reel-${Date.now()}.webm`, { type: "video/webm" }),
          );
      };

      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
      startTrackAudio();

      tickRef.current = window.setInterval(() => {
        setElapsed((s) => {
          const next = s + 1;
          if (next >= maxDuration) stopRecording();
          return next;
        });
      }, 1000);
    } catch {
      flash("Recording unavailable on this device");
    }
  };

  const shutter = () => {
    if (recording) stopRecording();
    else if (timer > 0) {
      flash(`Starting in ${timer}s`);
      window.setTimeout(() => void startRecording(), timer * 1000);
    } else void startRecording();
  };

  const handleNext = async () => {
    if (!selected) return;
    stopTrackAudio();

    const bgSrc = track ? getTrackAudioSrc(track) : undefined;
    const needsMerge = Boolean((bgSrc && musicVol > 0) || originalVol !== 1.0);

    if (!needsMerge) {
      setMergedSelected(selected);
      setPosting(true);
      return;
    }

    setLoading(true);
    try {
      const merged = await mergeVideoAndAudio(selected.url, bgSrc, {
        originalVolume: originalVol,
        musicVolume: musicVol,
        bgStartAt: track?.startAt ?? 0,
      });

      if (merged.blob && merged.blob.size > 0) {
        setMergedSelected({
          url: merged.url,
          file: new File([merged.blob], `reel-${Date.now()}.webm`, { type: "video/webm" }),
        });
      } else {
        setMergedSelected(selected);
      }
    } catch {
      setMergedSelected(selected);
    }
    setLoading(false);
    setPosting(true);
  };

  const reset = () => {
    stopRecording();
    setSelected(null);
    setMergedSelected(null);
    setTrimming(false);
    setPosting(false);
    setTrack(null);
    setOriginalVol(1.0);
    setMusicVol(0.8);
  };

  const close = () => {
    stopTrackAudio();
    reset();
    onClose();
  };

  if (!open) return null;

  if (posting && mergedSelected) {
    const bgAudioUrl = track ? getTrackAudioSrc(track) : undefined;
    return (
      <PostFeelsView
        mediaUrl={mergedSelected.url}
        file={mergedSelected.file}
        audioTrack={track ? `${track.title} • ${track.artist}` : "Original Audio"}
        audioUrl={bgAudioUrl}
        soundUrl={bgAudioUrl}
        onBack={() => setPosting(false)}
        onDone={close}
      />
    );
  }

  if (trimming && selected) {
    return (
      <VideoTrimmer
        src={selected.url}
        onCancel={() => setTrimming(false)}
        onSave={() => {
          setTrimming(false);
          flash("Trim saved");
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 h-[100dvh] w-full z-[999] bg-black text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <button onClick={close} aria-label="Close creator">
          <X className="w-6 h-6 text-white drop-shadow" />
        </button>
        <button
          onClick={() => setAudioOpen(true)}
          className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold max-w-[62%] border border-white/20 shadow-md ${
            track ? "bg-pink-600/90 text-white" : "bg-black/50 text-white"
          }`}
        >
          {track?.cover ? (
            <img src={track.cover} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
          ) : (
            <Music2 className="w-3.5 h-3.5 shrink-0 ml-1 text-pink-400" />
          )}
          <span className="truncate">{track ? `♪ ${track.title}` : "Add sound"}</span>
        </button>
        <span className="w-6" />
      </div>

      {recording && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-xs font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
          {String(elapsed % 60).padStart(2, "0")}
        </div>
      )}

      {timer > 0 && !recording && (
        <div className="absolute top-14 left-4 z-20 px-2.5 py-1 rounded-full bg-black/50 text-xs font-semibold">
          {timer}s
        </div>
      )}

      {/* Front-camera flash */}
      {flashOn && facing === "user" && !selected && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/85" />
      )}

      {banner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-zinc-900/95 border border-zinc-800 text-xs font-semibold animate-fade-in shadow-xl">
          {banner}
        </div>
      )}

      {/* Camera / Selected Video Preview */}
      <div className="flex-1 min-h-0 relative bg-black">
        {selected ? (
          <video
            ref={previewVideoRef}
            src={selected.url}
            controls
            playsInline
            autoPlay
            loop
            onError={(e) => {
              e.preventDefault();
            }}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ filter: filter.css }}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              onError={(e) => {
                e.preventDefault();
              }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: filter.css }}
            />
            {filter.specialGlitch && (
              <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden mix-blend-screen opacity-40">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-pink-500/20 animate-pulse" />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
                    backgroundSize: "100% 4px",
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Right Tool Button Bar */}
        {!selected ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 z-20">
            <ToolButton
              icon={<Images className="w-5 h-5" />}
              label="Gallery"
              onClick={() => fileInputRef.current?.click()}
            />
            <ToolButton
              icon={
                flashOn ? (
                  <Zap className="w-5 h-5 text-yellow-300" />
                ) : (
                  <ZapOff className="w-5 h-5" />
                )
              }
              label="Flash"
              onClick={() => {
                setFlashOn((f) => !f);
                flash(flashOn ? "Flash off" : "Flash on");
              }}
            />
            <ToolButton
              icon={<Sparkles className="w-5 h-5 text-pink-400" />}
              label="Filters"
              onClick={() => setFiltersOpen((prev) => !prev)}
            />
            <ToolButton
              icon={<Wand2 className="w-5 h-5 text-purple-400" />}
              label="Beauty"
              onClick={() => flash("Face Beauty Filters Active")}
            />
            <ToolButton
              icon={<span className="text-xs font-bold">{speed}x</span>}
              label="Speed"
              onClick={() => {
                const next = SPEEDS[(SPEEDS.indexOf(speed as 1) + 1) % SPEEDS.length]!;
                setSpeed(next);
                flash(`${next}x speed`);
              }}
            />
            <ToolButton
              icon={<Timer className="w-5 h-5" />}
              label="Timer"
              onClick={() => {
                const next = TIMERS[(TIMERS.indexOf(timer as 0) + 1) % TIMERS.length]!;
                setTimer(next);
                flash(next === 0 ? "Timer off" : `${next}s timer`);
              }}
            />
            <ToolButton
              icon={<RefreshCw className="w-5 h-5" />}
              label="Flip"
              onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            />
          </div>
        ) : (
          /* Video Selected Action Buttons */
          <div className="absolute right-3 top-16 z-20 flex flex-col gap-3">
            <button
              onClick={() => setTrimming(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-white border border-white/20 shadow-lg"
            >
              <Scissors className="w-3.5 h-3.5" /> Trim
            </button>
            <button
              onClick={() => setMixerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-pink-400 border border-pink-500/30 shadow-lg"
            >
              <Sliders className="w-3.5 h-3.5" /> Audio Mixer
            </button>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold">Processing Video Audio...</p>
          </div>
        )}
      </div>

      {/* Bottom Control Shutter */}
      <div className="relative z-20 pb-6 pt-2 space-y-2.5 bg-gradient-to-t from-black via-black/85 to-transparent">
        {!selected ? (
          <>
            {/* Active Filter Name & Creator Badge (Clickable to toggle filter tray) */}
            <div className="flex flex-col items-center justify-center animate-fade-in transition-all">
              <button
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-xl hover:bg-black/90 active:scale-95 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="font-bold">{filter.name}</span>
                <span className="text-[10px] text-pink-300/90 font-medium ml-0.5">
                  • {filter.creator}
                </span>
              </button>
            </div>

            {/* Scrollable Horizontal Filter Carousel Tray (Hidden by default, shown when filtersOpen is true) */}
            {filtersOpen && (
              <div className="w-full overflow-x-auto no-scrollbar py-1 px-4 animate-slide-up">
                <div className="flex items-center gap-3.5 min-w-max mx-auto justify-center py-1">
                  {CAMERA_FILTERS.map((f) => {
                    const isActive = filter.id === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFilter(f);
                          setFiltersOpen(false); // Auto-dismiss filter tray on selection
                          flash(`Filter: ${f.name}`);
                        }}
                        className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none transition-transform active:scale-95"
                      >
                        <div
                          className={`relative w-13 h-13 rounded-full p-0.5 overflow-hidden transition-all duration-200 ${
                            isActive
                              ? "scale-110 ring-2 ring-pink-500 border-2 border-white shadow-lg shadow-pink-500/50"
                              : "opacity-80 hover:opacity-100 border border-white/30"
                          }`}
                        >
                          <img
                            src={f.sampleImg}
                            alt={f.name}
                            className="w-full h-full rounded-full object-cover transition-all"
                            style={{ filter: f.css }}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                        <span
                          className={`text-[10px] max-w-[68px] truncate transition ${
                            isActive
                              ? "font-bold text-white drop-shadow"
                              : "text-zinc-400 font-medium"
                          }`}
                        >
                          {f.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recording Duration Selector & Shutter Button */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 text-xs font-semibold justify-center">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setMaxDuration(d.value)}
                  className={`shrink-0 px-2.5 py-0.5 rounded-full transition ${
                    maxDuration === d.value
                      ? "bg-pink-600 text-white font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center pt-1">
              <button
                onClick={shutter}
                className={`w-[72px] h-[72px] rounded-full border-4 flex items-center justify-center transition shadow-2xl ${
                  recording ? "border-red-500 animate-pulse" : "border-white/80"
                }`}
                aria-label={recording ? "Stop recording" : "Record"}
              >
                <span
                  className={`bg-pink-600 transition-all duration-200 ${
                    recording ? "w-8 h-8 rounded-lg" : "w-14 h-14 rounded-full"
                  }`}
                />
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 flex items-center gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-white hover:bg-zinc-800 transition"
            >
              Retake
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition shadow-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pickMedia(URL.createObjectURL(f), f);
          e.target.value = "";
        }}
      />

      {/* Audio Mixer Drawer Modal */}
      {mixerOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setMixerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-zinc-950 border-t border-zinc-800 rounded-t-3xl animate-slide-up p-5 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-500" /> Audio Mixer
              </h3>
              <button onClick={() => setMixerOpen(false)}>
                <X className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            {/* Original Camera Voice Track Control */}
            <div className="space-y-2 rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOriginalVol(originalVol > 0 ? 0 : 1.0)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-pink-400 hover:text-white"
                  >
                    {originalVol > 0 ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <MicOff className="w-4 h-4 text-rose-500" />
                    )}
                  </button>
                  <div>
                    <p className="text-xs font-bold text-white">Original Camera Voice</p>
                    <p className="text-[10px] text-zinc-400">
                      {originalVol > 0 ? `${Math.round(originalVol * 100)}% Volume` : "Muted"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOriginalVol(originalVol > 0 ? 0 : 1.0)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    originalVol > 0
                      ? "bg-zinc-800 text-zinc-300"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}
                >
                  {originalVol > 0 ? "Mute Voice" : "Unmute Voice"}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={originalVol}
                onChange={(e) => setOriginalVol(parseFloat(e.target.value))}
                className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Background Music Track Control */}
            <div className="space-y-2 rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-zinc-800 text-pink-500">
                    <Music2 className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[180px]">
                      {track ? track.title : "Added Background Sound"}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {Math.round(musicVol * 100)}% Volume
                    </p>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVol}
                onChange={(e) => setMusicVol(parseFloat(e.target.value))}
                className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={() => setMixerOpen(false)}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition shadow-lg"
            >
              Done Mixing
            </button>
          </div>
        </div>
      )}

      {/* Gallery drawer */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-end bg-black/60"
          onClick={() => setGalleryOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[70dvh] bg-zinc-950 border-t border-zinc-800 rounded-t-3xl animate-slide-up flex flex-col"
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            <div className="flex px-5 gap-6 border-b border-zinc-900 text-sm font-semibold">
              {(["videos", "collections"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGalleryTab(t)}
                  className={`py-2.5 capitalize border-b-2 ${
                    galleryTab === t
                      ? "border-pink-600 text-white"
                      : "border-transparent text-zinc-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-1">
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[9/16] rounded-md bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 text-xs text-zinc-400"
                >
                  <Images className="w-5 h-5" />
                  Device
                </button>
                {(galleryTab === "videos" ? galleryVideos : galleryVideos.slice(0, 6)).map(
                  (m, i) => (
                    <button
                      key={`${m.id}-${i}`}
                      onClick={() => pickMedia(m.mediaUrl)}
                      className="aspect-[9/16] rounded-md overflow-hidden bg-zinc-900"
                    >
                      {m.mediaUrl ? (
                        <video
                          src={getSafeVideoSrc(m.mediaUrl)}
                          muted
                          playsInline
                          preload="metadata"
                          onError={(e) => {
                            e.preventDefault();
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AudioPickerModal
        open={audioOpen}
        onClose={() => setAudioOpen(false)}
        onSelect={(t) => setTrack(t)}
      />
    </div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1" aria-label={label}>
      <span className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-md">
        {icon}
      </span>
      <span className="text-[10px] font-semibold text-white/90 drop-shadow">{label}</span>
    </button>
  );
}
