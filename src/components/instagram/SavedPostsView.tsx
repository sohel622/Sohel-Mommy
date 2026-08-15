import { useMemo } from "react";
import { ArrowLeft, Bookmark, Play, Film, X, Trash2 } from "lucide-react";
import { useApp, type SavedItem } from "@/lib/instagram/context";
import { getSafeVideoSrc } from "@/lib/instagram/media";

export function SavedPostsView() {
  const {
    savedItems,
    posts,
    reels,
    setView,
    openReel,
    toggleSaved,
    toggleBookmarkPost,
    showToast,
    t,
  } = useApp();

  // Combine savedItems (from context) and bookmarked video posts/reels
  const allSavedVideos = useMemo(() => {
    const list: Array<{
      id: number;
      kind: "reel" | "post";
      mediaUrl: string;
      caption: string;
      username: string;
      rawSavedItem?: SavedItem;
    }> = [];

    const seenIds = new Set<string>();

    // 1. Items directly in savedItems
    savedItems.forEach((item) => {
      if (item.mediaType === "video" || item.kind === "reel") {
        const key = `${item.kind}-${item.id}`;
        seenIds.add(key);
        list.push({
          id: item.id,
          kind: item.kind,
          mediaUrl: item.mediaUrl,
          caption: item.caption,
          username: item.username,
          rawSavedItem: item,
        });
      }
    });

    // 2. Posts that are bookmarked and are videos
    posts.forEach((p) => {
      if (p.isBookmarked && p.mediaType === "video") {
        const key = `post-${p.id}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          list.push({
            id: p.id,
            kind: "post",
            mediaUrl: p.mediaUrl,
            caption: p.caption,
            username: p.username,
          });
        }
      }
    });

    // 3. Fallback: If list is empty, default to giving the user top saved reels for instant playback
    if (list.length === 0 && reels.length > 0) {
      reels.slice(0, 6).forEach((r) => {
        list.push({
          id: r.id,
          kind: "reel",
          mediaUrl: r.mediaUrl,
          caption: r.caption,
          username: r.username,
        });
      });
    }

    return list;
  }, [savedItems, posts, reels]);

  const handleUnsave = (
    e: React.MouseEvent,
    item: { id: number; kind: "reel" | "post"; rawSavedItem?: SavedItem },
  ) => {
    e.stopPropagation();
    if (item.rawSavedItem) {
      toggleSaved(item.rawSavedItem);
    } else if (item.kind === "post") {
      toggleBookmarkPost(item.id);
    }
    showToast("Removed from saved posts");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("profile")}
            className="p-2 rounded-full bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 transition border border-slate-800"
            aria-label="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
              {t("saved_posts")}
            </h1>
            <p className="text-xs text-slate-400">
              {allSavedVideos.length} {t("saved_posts")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setView("profile")}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
        {allSavedVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-xl">
              <Bookmark className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h2 className="text-xl font-bold text-slate-100">No saved videos yet</h2>
              <p className="text-sm text-slate-400">
                When you bookmark reels and video posts, they will show up here for quick offline
                access.
              </p>
            </div>
            <button
              onClick={() => setView("reels")}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-bold rounded-full text-sm hover:brightness-110 transition shadow-lg flex items-center gap-2"
            >
              <Film className="w-4 h-4" /> Browse Feels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {allSavedVideos.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                onClick={() => openReel(item.id, 0)}
                className="group relative aspect-[9/16] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/80 shadow-md hover:shadow-2xl hover:border-amber-400/50 transition duration-300 cursor-pointer"
              >
                {/* Video Preview */}
                <video
                  src={getSafeVideoSrc(item.mediaUrl)}
                  preload="metadata"
                  muted
                  playsInline
                  onError={(e) => {
                    e.preventDefault();
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Film className="w-3 h-3" /> Video
                  </span>
                  <button
                    onClick={(e) => handleUnsave(e, item)}
                    title="Remove from saved"
                    className="p-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition border border-white/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 group-hover:bg-slate-950/20 transition">
                  <div className="w-11 h-11 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition transform">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pt-6 text-left">
                  <p className="text-xs font-bold text-slate-200 truncate">@{item.username}</p>
                  {item.caption && (
                    <p className="text-[11px] text-slate-300/90 truncate line-clamp-1">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
