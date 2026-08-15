import { useEffect, useState } from "react";
import { Bookmark, Loader2, UserPlus } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { getSafeVideoSrc } from "@/lib/instagram/media";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

/**
 * Instagram-style save flow:
 *   step 1 — "Collect the posts you love" sheet with a "Start a collection" CTA
 *   step 2 — "New collection" modal (Cancel / Save, name input, add people)
 * Saving commits the item and shows a "Saved to <name> | View" toast.
 */
export function SaveCollectionSheet() {
  const { saveTarget, closeSaveSheet, commitSave, showToast, setSavedSheetOpen } = useApp();
  const [step, setStep] = useState<"intro" | "new">("intro");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useBodyScrollLock(Boolean(saveTarget));

  useEffect(() => {
    if (saveTarget) {
      setStep("intro");
      setName("");
      setSaving(false);
    }
  }, [saveTarget]);

  if (!saveTarget) return null;

  const thumb =
    saveTarget.mediaType === "video" && saveTarget.mediaUrl ? (
      <video
        src={getSafeVideoSrc(saveTarget.mediaUrl)}
        preload="metadata"
        muted
        playsInline
        onError={(e) => {
          e.preventDefault();
        }}
        className="w-full h-full object-cover"
      />
    ) : saveTarget.mediaUrl ? (
      <img src={saveTarget.mediaUrl} alt="Saved" className="w-full h-full object-cover" />
    ) : (
      <Bookmark className="w-6 h-6 text-slate-500" />
    );

  const handleSave = () => {
    const collection = name.trim() || "Saved";
    setSaving(true);
    window.setTimeout(() => {
      commitSave(saveTarget, collection);
      setSaving(false);
      showToast(`Saved to ${collection} · View`);
      setSavedSheetOpen(false);
    }, 550);
  };

  return (
    <div
      id="save-collection-sheet"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
      onClick={closeSaveSheet}
    >
      <div
        data-modal-scrollable="true"
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto max-h-[85vh] flex flex-col bg-[#18181b] text-white border-t border-white/10 rounded-t-[28px] shadow-2xl animate-in slide-in-from-bottom duration-250 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {step === "intro" ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                {thumb}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold leading-tight text-white">Saved</p>
                <p className="text-xs text-slate-400">Private</p>
              </div>
              <Bookmark className="w-5 h-5 text-pink-500 fill-pink-500" />
            </div>
            <div className="flex flex-col items-center text-center gap-2 px-8 py-8">
              <p className="text-lg font-bold text-white">Collect the posts you love</p>
              <p className="text-sm text-slate-400">
                Save posts in collections just for you or build a collection with others.
              </p>
              <button
                onClick={() => setStep("new")}
                className="mt-3 w-full max-w-[280px] py-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF007F] text-white text-sm font-semibold shadow-lg shadow-pink-500/20 active:scale-98 transition"
              >
                Start a collection
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <button onClick={closeSaveSheet} className="text-sm text-slate-400 hover:text-white">
                Cancel
              </button>
              <p className="text-sm font-bold text-white">New collection</p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-sm font-semibold text-pink-400 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 px-6 py-6">
              <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                {thumb}
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Collection name"
                autoFocus
                className="w-full text-center text-lg font-semibold bg-transparent border-b border-slate-700 pb-2 text-white focus:outline-none placeholder:text-slate-500"
              />
              <button
                onClick={() => showToast("Add people coming soon")}
                className="w-full flex items-center gap-3 py-3 text-sm font-medium border-t border-slate-800 text-slate-300 hover:text-white"
              >
                <UserPlus className="w-5 h-5 text-pink-400" />
                Add people to this collection
              </button>
            </div>
          </>
        )}

        {saving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-t-[28px]">
            <Loader2 className="w-7 h-7 animate-spin text-pink-500" />
          </div>
        )}
      </div>
    </div>
  );
}
