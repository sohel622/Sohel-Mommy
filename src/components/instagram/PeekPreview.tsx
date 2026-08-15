import { useEffect, useRef } from "react";
import { EyeOff, Eye, BarChart3, Pin, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { useApp, postKey, reelKey } from "@/lib/instagram/context";
import { DEFAULT_AVATAR } from "@/lib/instagram/data";

export function PeekPreview() {
  const {
    peek,
    closePeek,
    posts,
    reels,
    isGlobalMuted,
    isHiddenFromGrid,
    toggleGridVisibility,
    toggleLikePost,
    toggleLikeReel,
    openComments,
    openShare,
    showToast,
  } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { kind, id } = peek;
  const reel = reels.find((r) => r.id === id);
  const post = posts.find((p) => p.id === id);
  const media = kind === "reel" ? (reel ?? post) : (post ?? reel);

  useEffect(() => {
    if (!peek.open) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = isGlobalMuted;
    v.play().catch(() => undefined);
  }, [peek.open, peek.id, isGlobalMuted]);

  if (!peek.open || !media) return null;

  const hidden = isHiddenFromGrid(id);
  const liked = kind === "reel" ? (reel?.isLiked ?? post?.isLiked) : post?.isLiked;
  const key = kind === "reel" && reel?.views !== "—" ? reelKey(id) : postKey(id);
  const audioTrack = reel?.audioTrack ?? `Original Audio - ${media.username}`;

  return (
    <div
      className="fixed inset-0 z-[100] backdrop-blur-xl bg-black/70 flex flex-col items-center justify-center p-4 gap-3 animate-fade-in overflow-y-auto no-scrollbar"
      onClick={closePeek}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] rounded-2xl overflow-hidden bg-black shadow-2xl"
      >
        <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-900/90">
          <img
            src={media.userAvatar || DEFAULT_AVATAR}
            alt={media.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate">{media.username}</p>
            <p className="text-[10px] text-slate-400 truncate">{audioTrack}</p>
          </div>
        </div>
        {media.mediaUrl ? (
          <video
            ref={videoRef}
            src={media.mediaUrl}
            className="w-full aspect-[9/16] object-cover transform-gpu translate-z-0 will-change-transform"
            style={{ transform: "translateZ(0)" }}
            loop
            playsInline
            autoPlay
            preload="auto"
            onError={(e) => {
              e.preventDefault();
            }}
          />
        ) : null}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] rounded-2xl overflow-hidden bg-neutral-900/95 border border-neutral-800 divide-y divide-neutral-800"
      >
        <PeekRow
          icon={hidden ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
          label={hidden ? "Add to main grid" : "Remove from main grid"}
          onClick={() => {
            toggleGridVisibility(id);
            showToast(hidden ? "Added to main grid" : "Removed from main grid");
            closePeek();
          }}
        />
        <PeekRow
          icon={<BarChart3 className="w-4.5 h-4.5" />}
          label="Insights"
          onClick={() => {
            showToast("Insights coming soon");
            closePeek();
          }}
        />
        <PeekRow
          icon={<Pin className="w-4.5 h-4.5" />}
          label="Pin to your reels"
          onClick={() => {
            showToast("Pinned to your reels");
            closePeek();
          }}
        />
        <PeekRow
          icon={<Heart className={`w-4.5 h-4.5 ${liked ? "text-rose-500 fill-rose-500" : ""}`} />}
          label={liked ? "Unlike" : "Like"}
          onClick={() => {
            if (kind === "reel") toggleLikeReel(id);
            else toggleLikePost(id);
          }}
        />
        <PeekRow
          icon={<MessageCircle className="w-4.5 h-4.5" />}
          label="Comment"
          onClick={() => {
            closePeek();
            openComments(key, media.username);
          }}
        />
        <PeekRow
          icon={<Repeat2 className="w-4.5 h-4.5" />}
          label="Repost / Share"
          onClick={() => {
            closePeek();
            openShare(media.mediaUrl, "video");
          }}
        />
      </div>
    </div>
  );
}

function PeekRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium text-slate-100 hover:bg-neutral-800 active:bg-neutral-800 transition"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
