import { memo, useState } from "react";
import { Clapperboard, EyeOff, Flag, MoreHorizontal } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { formatCount, type Reel, DEFAULT_AVATAR } from "@/lib/instagram/data";
import { getSafeVideoSrc } from "@/lib/instagram/media";

/** Facebook-style horizontal Reels carousel embedded in the home feed (max 5 cards). */
export const FeedReelsCarousel = memo(function FeedReelsCarousel() {
  const { reels, hiddenCarouselIds, showToast } = useApp();
  const visible = reels.filter((r) => !hiddenCarouselIds.includes(r.id)).slice(0, 5);

  if (visible.length === 0) return null;

  return (
    <section id="home-reels-carousel" className="bg-white dark:bg-black py-2">
      <div className="flex items-center justify-between px-4 py-1">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Clapperboard className="w-4.5 h-4.5" />
          Reels
        </h3>
        <button
          onClick={() => showToast("Reels settings")}
          className="text-slate-500 dark:text-slate-400"
          aria-label="Reels options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="flex overflow-x-auto gap-3 snap-x snap-mandatory no-scrollbar px-4 py-2 touch-pan-x">
        {visible.map((r) => (
          <CarouselCard key={r.id} reel={r} />
        ))}
      </div>
    </section>
  );
});

function CarouselCard({ reel }: { reel: Reel }) {
  const { openReel, setGlobalMuted, hideCarouselReel, showToast } = useApp();
  const [menu, setMenu] = useState(false);
  const [gone, setGone] = useState(false);

  const hide = () => {
    setGone(true);
    window.setTimeout(() => hideCarouselReel(reel.id), 250);
    showToast("See fewer posts like this");
  };

  return (
    <div
      onClick={() => {
        setGlobalMuted(false);
        openReel(reel.id, 0);
      }}
      className={`relative w-[160px] h-[280px] rounded-2xl overflow-hidden flex-shrink-0 snap-start bg-slate-100 dark:bg-slate-900/90 dark:backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-black/40 cursor-pointer transition-opacity duration-200 ${
        gone ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Frozen first-frame thumbnail — no autoplay, no loop, no audio. */}
      {reel.mediaUrl ? (
        <video
          src={getSafeVideoSrc(reel.mediaUrl)}
          muted
          loop={false}
          autoPlay={false}
          playsInline
          preload="metadata"
          tabIndex={-1}
          onError={(e) => {
            e.preventDefault();
            e.currentTarget.style.display = "none";
          }}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : null}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenu((m) => !m);
        }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
        aria-label="Card options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {menu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-10 right-2 z-10 w-44 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl"
        >
          <button
            onClick={hide}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100"
          >
            <EyeOff className="w-4 h-4" /> See fewer posts like this
          </button>
          <button
            onClick={() => {
              setMenu(false);
              showToast("Report submitted");
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-neutral-800"
          >
            <Flag className="w-4 h-4" /> Report post
          </button>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2">
        <img
          src={reel.userAvatar || DEFAULT_AVATAR}
          alt={reel.username}
          className="w-6 h-6 rounded-full object-cover ring-1 ring-white/50"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-white truncate">{reel.username}</p>
          <p className="text-[10px] font-medium text-white/85">
            {reel.views === "—" ? formatCount(reel.likes) : reel.views} views
          </p>
        </div>
      </div>
    </div>
  );
}
