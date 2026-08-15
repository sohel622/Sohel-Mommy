import { memo, useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useApp, postKey } from "@/lib/instagram/context";
import { ShareArrowIcon } from "./ShareArrowIcon";
import { formatCount, type Post, DEFAULT_AVATAR } from "@/lib/instagram/data";

function FeedPostBase({ post }: { post: Post }) {
  const {
    toggleLikePost,
    addComment,
    openLightbox,
    showToast,
    isGlobalMuted,
    toggleGlobalMute,
    isFollowing,
    toggleFollow,
    openComments,
    openShare,
    commentsByKey,
    openReel,
    openOptions,
    openPeek,
    isSaved,
    toggleSaved,
    openSaveSheet,
    openUserProfile,
    user,
    t,
  } = useApp();
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(0);
  const [ratio, setRatio] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef(0);
  const holdRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const movedRef = useRef(false);

  const key = postKey(post.id);
  const comments = commentsByKey[key] ?? [];
  const following = isFollowing(post.username);
  const isOwn = post.username === user.username;
  const saved = isSaved("post", post.id);

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize video audio & background music track
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = isGlobalMuted;
    if (!isGlobalMuted) {
      v.volume = 1.0;
    }

    const bgUrl = post.audioUrl || post.soundUrl;
    if (!bgUrl || post.mediaType !== "video" || bgUrl === post.mediaUrl) {
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
      if (!isGlobalMuted) {
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
      if (isGlobalMuted || v.paused) return;
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

    if (!isGlobalMuted && !v.paused) {
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
  }, [isGlobalMuted, post.audioUrl, post.soundUrl, post.mediaType, post.mediaUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || post.mediaType !== "video") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Newly visible videos inherit the global audio preference.
            v.muted = isGlobalMuted;
            if (!isGlobalMuted) v.volume = 1.0;
            v.play().catch(() => undefined);
          } else {
            v.pause();
          }
        });
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      // Release the decoder/buffer when this card unmounts or the tab changes.
      v.pause();
    };
  }, [post.mediaType, isGlobalMuted]);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (v && v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  // 400ms touch-and-hold on a feed video opens the peek & pop preview.
  const startHold = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = t ? { x: t.clientX, y: t.clientY, t: Date.now() } : null;
    movedRef.current = false;
    if (post.mediaType !== "video") return;
    if (holdRef.current) window.clearTimeout(holdRef.current);
    holdRef.current = window.setTimeout(() => {
      if (!movedRef.current) openPeek("post", post.id);
    }, 400);
  };
  // NOTE: never call preventDefault/stopPropagation here — the vertical drag
  // must always reach the feed scroll container.
  const onTouchMove = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    const t = e.touches[0];
    if (start && t && (Math.abs(t.clientY - start.y) > 8 || Math.abs(t.clientX - start.x) > 8)) {
      movedRef.current = true;
      cancelHold();
    }
  };
  const cancelHold = () => {
    if (holdRef.current) window.clearTimeout(holdRef.current);
    holdRef.current = null;
  };

  // Single tap on a feed video jumps straight to the full-screen Reels tab.
  // Double-tap-to-like is intentionally Reels-only, so no heart gesture here.
  const handleMediaTap = () => {
    const start = touchStartRef.current;
    // Ignore drags and long presses — only quick taps activate media.
    if (movedRef.current) return;
    if (start && Date.now() - start.t > 350) return;
    lastTapRef.current = Date.now();
    if (post.mediaType === "video") {
      watchReel();
    } else {
      openLightbox({
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        authorAvatar: post.userAvatar,
        authorName: post.username,
        caption: post.caption,
      });
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment(post.id, comment.trim());
    setComment("");
  };

  const watchReel = () => openReel(post.id, videoRef.current?.currentTime ?? 0);

  return (
    <article
      className="bg-white dark:bg-black text-slate-900 dark:text-slate-100 rounded-none md:rounded-2xl overflow-hidden touch-pan-y"
      style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex min-w-0 items-center space-x-3">
          <button
            onClick={() => openUserProfile(post.username)}
            className="p-[2px] rounded-full story-ring shrink-0"
            aria-label={`Open ${post.username}'s profile`}
          >
            <div className="p-[2px] bg-slate-900 rounded-full">
              <img
                src={post.userAvatar || DEFAULT_AVATAR}
                className="w-9 h-9 rounded-full object-cover"
                alt={post.username}
              />
            </div>
          </button>
          <div className="min-w-0" onClick={() => openUserProfile(post.username)}>
            <p className="text-sm font-semibold leading-tight truncate cursor-pointer">
              {post.username}
            </p>
            {post.location && (
              <p className="text-[11px] text-slate-400 leading-tight truncate">{post.location}</p>
            )}
          </div>
          {!isOwn && (
            <button
              onClick={() => toggleFollow(post.username)}
              className="shrink-0 w-[86px] text-center text-xs font-semibold px-3 py-1 rounded-md border border-slate-500/60 hover:border-pink-500 transition"
            >
              {following ? t("following") : t("follow")}
            </button>
          )}
        </div>
        <button
          onClick={() => openOptions("post", post.id)}
          className="text-slate-300 hover:text-white shrink-0"
          aria-label="More"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media — height follows the media's native aspect ratio, no black bars */}
      <div
        className="relative w-full cursor-pointer select-none overflow-hidden max-h-[75vh] bg-white dark:bg-black touch-pan-y"
        style={{
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
          ...(post.mediaType === "video" ? { aspectRatio: ratio ? String(ratio) : "4 / 5" } : null),
        }}
        onClick={handleMediaTap}

        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchMove={onTouchMove}
        onContextMenu={(e) => post.mediaType === "video" && e.preventDefault()}
      >
        {post.mediaType === "image" ? (
          post.mediaUrl ? (
            <img
              src={post.mediaUrl}
              alt={post.caption}
              className="w-full h-auto object-cover touch-pan-y"
              style={{ touchAction: "pan-y" }}
              draggable={false}
            />
          ) : (
            <div className="w-full min-h-[160px] p-6 bg-gradient-to-tr from-pink-600/10 via-purple-600/10 to-blue-600/10 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-blue-950/30 flex items-center justify-center text-center">
              <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 px-4">
                {post.caption}
              </p>
            </div>
          )
        ) : (
          <>
            {post.mediaUrl ? (
              <video
                ref={videoRef}
                src={post.mediaUrl}
                className="absolute inset-0 w-full h-full object-cover touch-pan-y transform-gpu translate-z-0 will-change-transform"
                style={{ touchAction: "pan-y", transform: "translateZ(0)" }}
                loop
                muted={isGlobalMuted}
                autoPlay
                playsInline
                preload="auto"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onError={(e) => {
                  e.preventDefault();
                }}
              />
            ) : null}

            <button
              onClick={(e) => {
                e.stopPropagation();
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
              }}
              className="absolute bottom-5 right-3 w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm text-white flex items-center justify-center transition active:scale-95"
              aria-label="Toggle sound"
            >
              {isGlobalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Seekable progress bar, flush to the bottom of the video frame */}
            <div
              onClick={seek}
              className="video-progress-container absolute left-0 right-0 bottom-0 h-1 bg-white/25 cursor-pointer"
            >
              <div
                className="h-full bg-white transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => toggleLikePost(post.id)} aria-label="Like">
              <Heart
                className={`w-6 h-6 transition ${
                  post.isLiked
                    ? "text-rose-500 fill-rose-500"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              />
            </button>
            <button onClick={() => openComments(key, post.username)} aria-label="Comment">
              <MessageCircle className="w-6 h-6 text-slate-700 dark:text-slate-200 transition" />
            </button>
            <button onClick={() => openShare(post.mediaUrl, post.mediaType)} aria-label="Share">
              <ShareArrowIcon className="w-6 h-6 text-slate-700 dark:text-slate-200 transition" />
            </button>
          </div>
          <button
            onClick={() => {
              const item = {
                kind: "post" as const,
                id: post.id,
                mediaUrl: post.mediaUrl,
                mediaType: post.mediaType,
                caption: post.caption,
                username: post.username,
              };
              if (saved) {
                toggleSaved(item);
                showToast(t("removed_from_saved"));
              } else {
                openSaveSheet(item);
              }
            }}
            aria-label="Bookmark"
          >
            <Bookmark
              className={`w-6 h-6 transition ${
                saved
                  ? "text-slate-900 dark:text-slate-100 fill-current"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            />
          </button>
        </div>

        <p className="text-sm font-semibold">
          {formatCount(post.likes)} {t("likes")}
        </p>

        <p className="text-sm">
          <span className="font-semibold mr-2">{post.username}</span>
          <span className="text-slate-700 dark:text-slate-200">{post.caption}</span>
        </p>

        {comments.length > 0 && (
          <button
            onClick={() => openComments(key, post.username)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            {t("view_all_comments")} ({comments.length})
          </button>
        )}

        {comments.slice(-2).map((c) => (
          <p key={c.id} className="text-sm">
            <span className="font-semibold mr-2">{c.username}</span>
            <span className="text-slate-300">{c.text}</span>
          </p>
        ))}

        <p className="text-[10px] tracking-wider text-slate-500 uppercase">{post.timeAgo}</p>
      </div>

      {/* Comment input */}
      <form
        onSubmit={submitComment}
        className="flex items-center gap-2 border-t border-slate-200 dark:border-neutral-900 px-3 py-2.5"
      >
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("add_comment")}
          className="flex-1 bg-transparent text-sm placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!comment.trim()}
          className="text-sm font-semibold text-sky-400 disabled:text-sky-800 disabled:cursor-not-allowed"
        >
          {t("post")}
        </button>
      </form>
    </article>
  );
}

export const FeedPost = memo(FeedPostBase);
