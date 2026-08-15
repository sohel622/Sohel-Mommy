import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Camera, Send, Sparkles } from "lucide-react";
import { ShareArrowIcon } from "./ShareArrowIcon";
import { useApp, reelKey, postKey } from "@/lib/instagram/context";
import { formatCount, type Reel } from "@/lib/instagram/data";
import { ReelsCreateModal } from "./ReelsCreateModal";

/** Instagram's exact 2-line options icon: long top bar, short bottom bar. */
function OptionsLinesIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="14" y2="15" />
    </svg>
  );
}

function ReelItem({
  reel,
  active,
  startTime,
  cleanView,
  setCleanView,
}: {
  reel: Reel;
  active: boolean;
  startTime?: number;
  cleanView: boolean;
  setCleanView: (v: boolean) => void;
}) {
  const {
    toggleLikeReel,
    isGlobalMuted,
    toggleGlobalMute,
    isFollowing,
    toggleFollow,
    openComments,
    openShare,
    openOptions,
    openUserProfile,
    commentsByKey,
    reels,
    user,
    showToast,
    registerReelLoop,
    addCommentTo,
    t,
  } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [commentInput, setCommentInput] = useState("");
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const lastTapRef = useRef(0);
  const seededRef = useRef(false);

  // Reels sourced from feed posts share the post's comment thread.
  const isNativeReel = reels.some((r) => r.id === reel.id && r.views !== "—");
  const key = isNativeReel ? reelKey(reel.id) : postKey(reel.id);
  const commentCount = (commentsByKey[key] ?? []).length;
  const following = isFollowing(reel.username);
  const isOwn = reel.username === user.username;

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isGlobalMuted;
    if (!isGlobalMuted) v.volume = 1;
    if (active) {
      if (startTime && !seededRef.current) {
        seededRef.current = true;
        try {
          v.currentTime = startTime;
        } catch {
          // ignore
        }
      }
      v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  }, [active, isGlobalMuted, startTime]);

  // Synchronize background audio with video element
  useEffect(() => {
    const bgUrl = reel.audioUrl || reel.soundUrl;
    const v = videoRef.current;
    if (!v) return;

    if (!bgUrl || bgUrl === reel.mediaUrl) {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
      return;
    }

    if (!bgAudioRef.current || bgAudioRef.current.src !== bgUrl) {
      if (bgAudioRef.current) bgAudioRef.current.pause();
      const audio = new Audio();
      audio.onerror = (e) => e.preventDefault();
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";
      audio.src = bgUrl;
      bgAudioRef.current = audio;
    }

    const bgAudio = bgAudioRef.current;

    const handlePlay = () => {
      if (active && !isGlobalMuted) {
        bgAudio.currentTime = v.currentTime;
        bgAudio.muted = false;
        bgAudio.volume = 1.0;
        void bgAudio.play().catch(() => undefined);
      }
    };

    const handlePause = () => {
      bgAudio.pause();
    };

    const handleSeeking = () => {
      bgAudio.currentTime = v.currentTime;
    };

    const handleTimeUpdate = () => {
      if (!active || isGlobalMuted || v.paused) return;
      if (Math.abs(bgAudio.currentTime - v.currentTime) > 0.5) {
        bgAudio.currentTime = v.currentTime;
      }
    };

    v.addEventListener("play", handlePlay);
    v.addEventListener("playing", handlePlay);
    v.addEventListener("pause", handlePause);
    v.addEventListener("seeking", handleSeeking);
    v.addEventListener("seeked", handleSeeking);
    v.addEventListener("timeupdate", handleTimeUpdate);

    if (active && !isGlobalMuted && !v.paused) {
      handlePlay();
    } else {
      bgAudio.pause();
    }

    return () => {
      v.removeEventListener("play", handlePlay);
      v.removeEventListener("playing", handlePlay);
      v.removeEventListener("pause", handlePause);
      v.removeEventListener("seeking", handleSeeking);
      v.removeEventListener("seeked", handleSeeking);
      v.removeEventListener("timeupdate", handleTimeUpdate);
      bgAudio.pause();
    };
  }, [active, isGlobalMuted, reel.audioUrl, reel.soundUrl, reel.mediaUrl]);

  const like = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (isOwn) {
      showToast("You cannot like your own video");
      return;
    }
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
    toggleLikeReel(reel.id);
  };

  const popHeart = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    const x = rect ? clientX - rect.left : 0;
    const y = rect ? clientY - rect.top : 0;
    const id = Date.now() + Math.random();
    setHearts((h) => [...h, { id, x, y }]);
    window.setTimeout(() => setHearts((h) => h.filter((i) => i.id !== id)), 850);
  };

  const toggleSound = () => {
    const nextMuted = !isGlobalMuted;
    toggleGlobalMute();
    const v = videoRef.current;
    if (v) {
      v.muted = nextMuted;
      if (!nextMuted) {
        v.volume = 1.0;
        void v.play().catch(() => undefined);
      }
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.muted = nextMuted;
      if (!nextMuted) {
        bgAudioRef.current.volume = 1.0;
        if (v) bgAudioRef.current.currentTime = v.currentTime;
        void bgAudioRef.current.play().catch(() => undefined);
      }
    }
    showToast(nextMuted ? "Muted 🔇" : "Sound On 🔊");
  };

  const handleTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (holdFired.current) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (isOwn) {
        showToast("You cannot like your own video");
      } else {
        if (!liked) like();
        popHeart(e.clientX, e.clientY);
      }
    } else {
      toggleSound();
    }
    lastTapRef.current = now;
  };

  // Touch-and-hold anywhere on the video: pause + clean, zero-overlay view.
  const holdTimer = useRef<number | null>(null);
  const holdFired = useRef(false);

  const startHold = () => {
    holdFired.current = false;
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      holdFired.current = true;
      videoRef.current?.pause();
      setCleanView(true);
    }, 220);
  };

  const endHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (holdFired.current) {
      setCleanView(false);
      void videoRef.current?.play().catch(() => undefined);
    }
    holdFired.current = false;
  };

  useEffect(
    () => () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
    },
    [],
  );

  const lastTimeRef = useRef<number>(0);
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) {
      setProgress((v.currentTime / v.duration) * 100);
      // If video looped back to start from near the end
      if (v.currentTime < lastTimeRef.current - 1 && lastTimeRef.current > v.duration * 0.8) {
        registerReelLoop(reel.id);
      }
      lastTimeRef.current = v.currentTime;
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  return (
    <div
      ref={frameRef}
      className="relative w-full h-full snap-start snap-always flex-shrink-0 bg-black overflow-hidden"
      style={{ height: "100%" }}
    >
      {reel.mediaUrl ? (
        <video
          ref={videoRef}
          src={reel.mediaUrl}
          loop
          autoPlay
          playsInline
          muted={isGlobalMuted}
          preload="auto"
          onClick={handleTap}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onPointerLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onTouchCancel={endHold}
          onTimeUpdate={onTimeUpdate}
          onError={(e) => {
            e.preventDefault();
          }}
          className="absolute inset-0 w-full h-full object-contain md:object-cover transform-gpu translate-z-0 will-change-transform select-none"
          style={{ transform: "translateZ(0)" }}
        />
      ) : null}

      {/* HD red-to-pink gradient double-tap heart — Reels viewport only */}
      {hearts.map((h) => (
        <svg
          key={h.id}
          viewBox="0 0 24 24"
          className="floating-heart-animation absolute w-28 h-28"
          style={{ left: h.x, top: h.y }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`hg-${h.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF0055" />
              <stop offset="50%" stopColor="#FF007F" />
              <stop offset="100%" stopColor="#FF33A6" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#hg-${h.id})`}
            d="M12 21s-7.5-4.7-9.6-9A5.6 5.6 0 0 1 12 6.2 5.6 5.6 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9Z"
          />
        </svg>
      ))}

      {/* Right side actions - shifted upwards above bottom area */}
      <div
        className={`absolute right-3 bottom-28 z-30 flex flex-col items-center gap-3.5 text-white drop-shadow-lg transition-opacity duration-200 ${
          cleanView ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}
      >
        {/* Like Button */}
        <button onClick={like} className="flex flex-col items-center" aria-label="Like">
          <Heart className={`w-7 h-7 ${liked ? "text-rose-500 fill-rose-500" : "text-white"}`} />
          <span className="text-xs font-semibold drop-shadow">{formatCount(likeCount)}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => openComments(key, reel.username)}
          className="flex flex-col items-center"
          aria-label="Comment"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="text-xs font-semibold drop-shadow">{formatCount(commentCount)}</span>
        </button>

        {/* Share Button */}
        <button
          id="reels-sidebar-share"
          onClick={(e) => {
            e.stopPropagation();
            openShare(reel.mediaUrl, "video");
          }}
          className="flex flex-col items-center"
          aria-label="Share"
        >
          <ShareArrowIcon className="w-7 h-7 text-white" />
          <span className="text-[10px] font-semibold drop-shadow">{t("share")}</span>
        </button>

        {/* Options / More Button (directly below Share) */}
        <button
          onClick={() => openOptions(isNativeReel ? "reel" : "post", reel.id)}
          className="flex flex-col items-center p-1"
          aria-label="More options"
        >
          <OptionsLinesIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Bottom overlay — floats over video at bottom edge across full width */}
      <div
        className={`absolute left-3 right-3 bottom-3 z-20 text-white space-y-2.5 drop-shadow-xl transition-opacity duration-200 ${
          cleanView ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        }`}
      >
        {/* Creator Avatar & Handle */}
        <div className="flex items-center gap-2">
          <img
            src={reel.userAvatar}
            onClick={(e) => {
              e.stopPropagation();
              openUserProfile(reel.username);
            }}
            className="w-8 h-8 rounded-full object-cover border border-white/80 shadow-md cursor-pointer hover:scale-105 transition shrink-0"
            alt={reel.username}
          />
          <span
            onClick={() => openUserProfile(reel.username)}
            className="text-base font-extrabold text-white tracking-tight cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] hover:underline"
          >
            @{reel.username}
          </span>
          {!isOwn && (
            <button
              onClick={() => toggleFollow(reel.username)}
              className="text-xs font-bold px-2.5 py-0.5 border border-white/60 rounded-full bg-black/30 backdrop-blur-md hover:bg-white/20 transition"
            >
              {following ? t("following") : t("follow")}
            </button>
          )}
        </div>

        {/* Caption */}
        <p className="text-xs sm:text-sm text-slate-100 line-clamp-2 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pr-2">
          {reel.caption}
        </p>

        {/* Video Progress Bar (timeline bar) placed directly above the comment bar */}
        <div
          onClick={seek}
          className="w-full h-1 sm:h-1.5 bg-white/25 rounded-full overflow-hidden cursor-pointer my-1 backdrop-blur-sm"
          aria-label="Video progress bar"
        >
          <div
            className="h-full bg-white transition-[width] duration-75 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Full-Width "Add a comment..." Input Bar */}
        <div className="w-full pt-0.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!commentInput.trim()) return;
              addCommentTo(key, commentInput.trim());
              setCommentInput("");
              showToast("Comment posted! 💬");
            }}
            className="flex items-center px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/30 shadow-2xl focus-within:border-amber-400 transition w-full"
          >
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={t("add_comment")}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-300 font-medium focus:outline-none min-w-0"
            />
            {commentInput.trim().length > 0 && (
              <button
                type="submit"
                className="p-1.5 rounded-full text-amber-400 hover:scale-110 transition shrink-0 ml-2 animate-in fade-in zoom-in-75 duration-150"
                aria-label="Send comment"
              >
                <Send className="w-4 h-4 fill-amber-400" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export function ReelsView() {
  const { reels, reelFocus, clearReelFocus, setView, isGlobalMuted, toggleGlobalMute } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [cleanView, setCleanView] = useState(false);
  const mutedBeforeCameraRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchYRef = useRef<number | null>(null);

  // Auto-hide the top header while watching / scrolling; a drag-down reveals it.
  const revealHeader = useCallback(() => {
    setHeaderVisible(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setHeaderVisible(false), 2600);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      touchYRef.current = touch.clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const startY = touchYRef.current;
    const currentY = e.touches[0]?.clientY;
    if (startY != null && currentY != null && currentY - startY > 24) revealHeader();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    // Ignore if touch started/ended inside an input or textarea
    const targetEl = e.target as HTMLElement | null;
    if (targetEl?.closest("input, textarea, select")) {
      touchStartRef.current = null;
      touchYRef.current = null;
      return;
    }

    // Horizontal Swipe-Right (Left-to-Right gesture) to navigate back to Home:
    // Minimum 65px horizontal displacement and strictly dominant horizontal axis (|deltaX| > |deltaY| * 1.5)
    if (deltaX > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      setView("feed");
    }

    touchStartRef.current = null;
    touchYRef.current = null;
  };

  useEffect(() => {
    revealHeader();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [revealHeader]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-reel-index]"));
    if (items.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            const idx = Number((entry.target as HTMLElement).dataset.reelIndex);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root: el, threshold: [0.65] },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [reels.length]);

  // Deep link from the Home feed: jump to that exact video.
  useEffect(() => {
    if (!reelFocus) return;
    const idx = reels.findIndex((r) => r.id === reelFocus.id);
    if (idx < 0) return;
    setActiveIndex(idx);
    const el = containerRef.current;
    const target = el?.querySelector<HTMLElement>(`[data-reel-index="${idx}"]`);
    target?.scrollIntoView({ block: "start" });
  }, [reelFocus, reels]);

  useEffect(() => () => clearReelFocus(), [clearReelFocus]);

  // Clean view hides the bottom nav too (rendered outside this subtree).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("clean-view", cleanView);
    return () => root.classList.remove("clean-view");
  }, [cleanView]);

  // Opening the camera mutes background feed/reel audio; closing restores it.
  const openCamera = () => {
    mutedBeforeCameraRef.current = isGlobalMuted;
    if (!isGlobalMuted) toggleGlobalMute();
    document.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      v.pause();
    });
    setCreateOpen(true);
  };

  const closeCamera = () => {
    setCreateOpen(false);
    if (!mutedBeforeCameraRef.current && isGlobalMuted) toggleGlobalMute();
  };

  return (
    <section
      id="reels-container"
      className="fixed inset-0 md:relative md:inset-auto w-full h-[100dvh] md:h-[calc(100vh-2rem)] md:max-w-[420px] md:mx-auto md:rounded-3xl bg-black overflow-hidden z-30 md:z-auto select-none"
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`absolute top-4 left-4 z-40 transition-all duration-300 ${
          headerVisible && !cleanView
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setView("feed")}
          className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      <div
        className={`absolute top-4 right-4 z-40 transition-all duration-300 ${
          headerVisible && !cleanView
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={openCamera}
          className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm"
          aria-label="Open camera"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {reels.map((r, i) => (
          <div
            key={`${r.id}-${i}`}
            id={`reel-${r.id}`}
            data-reel-index={i}
            className="w-full h-full snap-start snap-always"
            style={{ height: "100%" }}
          >
            <ReelItem
              reel={r}
              active={i === activeIndex}
              startTime={reelFocus?.id === r.id ? reelFocus.time : undefined}
              cleanView={cleanView}
              setCleanView={setCleanView}
            />
          </div>
        ))}
      </div>

      <ReelsCreateModal open={createOpen} onClose={closeCamera} />
    </section>
  );
}
