import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Flame,
  Play,
  Pause,
  Camera,
  Heart,
  Music2,
  Sparkles,
  Share2,
} from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { formatCount, DEFAULT_AVATAR } from "@/lib/instagram/data";
import { ReelsCreateModal } from "./ReelsCreateModal";

export function SoundDetailsView() {
  const { activeSound, setView, reels, openReel, showToast } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback default sound details if none selected directly
  const soundTitle = activeSound?.title || "Original Sound - Trending Mix";
  const artistName = activeSound?.artist || "trending_creator";
  const coverUrl =
    activeSound?.cover ||
    reels[0]?.userAvatar ||
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80";
  const audioSrc =
    activeSound?.audioUrl ||
    activeSound?.soundUrl ||
    reels[0]?.audioUrl ||
    reels[0]?.soundUrl ||
    "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";

  // Filter reels matching this sound, or fallback to all reels
  const matchingReels = reels.filter(
    (r) =>
      r.audioTrack.toLowerCase().includes(soundTitle.toLowerCase()) ||
      soundTitle.toLowerCase().includes(r.audioTrack.toLowerCase()) ||
      r.username.toLowerCase() === artistName.toLowerCase(),
  );
  const displayedReels = matchingReels.length > 0 ? matchingReels : reels;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, []);

  const toggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    showToast(next ? "Added to Favorite Sounds ❤️" : "Removed from Favorites");
  };

  const handleUseSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCreateOpen(true);
  };

  return (
    <div className="w-full max-w-[935px] mx-auto min-h-screen pb-24 px-4 sm:px-6 pt-2 sm:pt-4 text-slate-900 dark:text-slate-100">
      {/* Hidden Audio Player for Preview */}
      {audioSrc ? (
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      ) : null}

      {/* 1. Top Bar */}
      <div className="flex items-center justify-between py-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setView("reels")}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200 flex items-center justify-center border border-slate-200/80 dark:border-slate-800"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-extrabold tracking-tight hidden sm:block">Sound Details</h1>

        {/* Trending Sounds Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 text-xs font-bold tracking-wide shadow-sm">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Trending Sounds</span>
        </div>
      </div>

      {/* 2. Sound Header Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {/* Square Audio Thumbnail with embedded Play/Pause */}
          <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden group shadow-2xl ring-2 ring-amber-400/30">
            <img
              src={coverUrl || DEFAULT_AVATAR}
              alt={soundTitle}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-lg transition transform active:scale-95"
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-slate-950" />
                ) : (
                  <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                )}
              </button>
            </div>
            {/* Spinning Indicator when playing preview */}
            {isPlaying && (
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-amber-400 animate-spin">
                <Music2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Sound Info Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/10 text-amber-500 text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> Audio Track
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {soundTitle}
            </h2>

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              by <span className="font-bold text-slate-700 dark:text-slate-200">@{artistName}</span>
            </p>

            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {formatCount(displayedReels.length * 1280 + 3400)} reels created using this sound
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
              {/* Primary Yellow "Use Sound" button with Camera icon */}
              <button
                onClick={handleUseSound}
                className="py-3 px-6 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-xl transition flex items-center gap-2 transform active:scale-95 border border-amber-300/50"
              >
                <Camera className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Use Sound</span>
              </button>

              {/* Secondary Favorite Button */}
              <button
                onClick={toggleFavorite}
                className={`p-3 rounded-full border transition flex items-center justify-center shadow-md ${
                  isFavorite
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-500"
                    : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                }`}
                aria-label="Bookmark sound"
                title="Favorite Sound"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>

              {/* Share button */}
              <button
                onClick={() => showToast(`Link copied for ${soundTitle}`)}
                className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center justify-center shadow-md"
                title="Share Sound"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sound Video Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Music2 className="w-4 h-4 text-amber-500" />
            <span>Reels using this audio</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">{displayedReels.length} videos</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {displayedReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => {
                openReel(reel.id);
                setView("reels");
              }}
              className="relative aspect-[9/16] rounded-2xl bg-slate-900 overflow-hidden cursor-pointer group shadow-md transition-all hover:scale-[1.02]"
            >
              {reel.mediaUrl ? (
                <video
                  src={reel.mediaUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : null}
              {/* Gradient Bottom Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition" />

              {/* Top Creator Info */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <img
                  src={reel.userAvatar || DEFAULT_AVATAR}
                  alt={reel.username}
                  className="w-5 h-5 rounded-full object-cover border border-white/40 shadow"
                />
                <span className="text-[10px] font-bold text-white drop-shadow truncate max-w-[70px]">
                  {reel.username}
                </span>
              </div>

              {/* Bottom Play Stats */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold drop-shadow">
                <div className="flex items-center gap-1">
                  <Play className="w-3 h-3 fill-white" />
                  <span>{reel.views || "12.4K"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>{formatCount(reel.likes)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Creator Modal */}
      <ReelsCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialTrack={{
          id: activeSound?.id || 101,
          title: soundTitle,
          artist: artistName,
          src: audioSrc,
          cover: coverUrl,
        }}
      />
    </div>
  );
}
