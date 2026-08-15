import { useMemo, useState } from "react";
import { Bookmark, ChevronLeft, X } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { getSafeVideoSrc } from "@/lib/instagram/media";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

export function SavedSheet() {
  const { savedSheetOpen, setSavedSheetOpen, savedItems, openReel, openLightbox, user, showToast } =
    useApp();

  const [openCollection, setOpenCollection] = useState<string | null>(null);

  useBodyScrollLock(savedSheetOpen);

  // Instagram groups saved media into named collections; ungrouped items live in "All posts".
  const collections = useMemo(() => {
    const map = new Map<string, typeof savedItems>();
    savedItems.forEach((s) => {
      const name = s.collection || "All posts";
      map.set(name, [...(map.get(name) ?? []), s]);
    });
    return Array.from(map.entries());
  }, [savedItems]);

  if (!savedSheetOpen) return null;

  const cover = savedItems[0];
  const shown = openCollection
    ? (collections.find(([n]) => n === openCollection)?.[1] ?? [])
    : savedItems;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
      onClick={() => setSavedSheetOpen(false)}
    >
      <div
        data-modal-scrollable="true"
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto h-[65dvh] max-h-[85vh] flex flex-col bg-[#18181b] border-t border-white/10 rounded-t-[28px] shadow-2xl text-white animate-in slide-in-from-bottom duration-250 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0">
            {cover ? (
              cover.mediaType === "video" && cover.mediaUrl ? (
                <video
                  src={getSafeVideoSrc(cover.mediaUrl)}
                  preload="metadata"
                  muted
                  playsInline
                  onError={(e) => {
                    e.preventDefault();
                  }}
                  className="w-full h-full object-cover"
                />
              ) : cover.mediaUrl ? (
                <img src={cover.mediaUrl} alt="Saved" className="w-full h-full object-cover" />
              ) : (
                <Bookmark className="w-5 h-5 text-slate-400" />
              )
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400" />
            )}
          </div>
          {openCollection && (
            <button onClick={() => setOpenCollection(null)} aria-label="Back">
              <ChevronLeft className="w-5 h-5 text-slate-100" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-100 leading-tight truncate">
              {openCollection ?? "Saved"}
            </p>
            <p className="text-xs text-slate-400">Private</p>
          </div>
          <button
            onClick={() => setSavedSheetOpen(false)}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {savedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-3">
              <Bookmark className="w-14 h-14 text-slate-300" strokeWidth={1.2} />
              <p className="text-lg font-bold text-slate-100">Collect the posts you love</p>
              <p className="text-sm text-slate-500">
                Save photos and videos to your private collection so you can find them later.
              </p>
              <button
                onClick={() => {
                  setSavedSheetOpen(false);
                  showToast("Start saving posts to build a collection");
                }}
                className="mt-1 px-5 py-2.5 rounded-lg bg-sky-500 text-white text-sm font-semibold"
              >
                Start a collection
              </button>
            </div>
          ) : (
            <>
              {!openCollection && collections.length > 0 && (
                <div className="flex gap-3 overflow-x-auto no-scrollbar px-3 py-3">
                  {collections.map(([name, items]) => (
                    <button
                      key={name}
                      onClick={() => setOpenCollection(name)}
                      className="w-24 flex-shrink-0 text-left"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-900">
                        {items[0].mediaType === "video" && items[0].mediaUrl ? (
                          <video
                            src={getSafeVideoSrc(items[0].mediaUrl)}
                            preload="metadata"
                            muted
                            playsInline
                            onError={(e) => {
                              e.preventDefault();
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : items[0].mediaUrl ? (
                          <img
                            src={items[0].mediaUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-100 truncate">{name}</p>
                      <p className="text-[10px] text-slate-500">{items.length}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-0.5 p-0.5">
                {shown.map((s) => (
                  <button
                    key={`${s.kind}-${s.id}`}
                    onClick={() => {
                      setSavedSheetOpen(false);
                      if (s.mediaType === "video") openReel(s.id, 0);
                      else
                        openLightbox({
                          mediaUrl: s.mediaUrl,
                          mediaType: "image",
                          authorAvatar: user.avatar,
                          authorName: s.username,
                          caption: s.caption,
                        });
                    }}
                    className="relative aspect-square bg-neutral-900 overflow-hidden"
                  >
                    {s.mediaType === "video" && s.mediaUrl ? (
                      <video
                        src={getSafeVideoSrc(s.mediaUrl)}
                        preload="metadata"
                        muted
                        playsInline
                        onError={(e) => {
                          e.preventDefault();
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : s.mediaUrl ? (
                      <img
                        src={s.mediaUrl}
                        alt={s.caption}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
