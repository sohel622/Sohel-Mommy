import { useEffect, useState } from "react";
import {
  BarChart2,
  Bookmark,
  Download,
  Heart,
  MessageCircle,
  Pencil,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { CopyrightReportModal } from "./CopyrightReportModal";
import { downloadWithWatermark } from "@/lib/instagram/download";
import { useApp, postKey, reelKey } from "@/lib/instagram/context";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

export function MediaOptionsSheet() {
  const {
    optionsSheet,
    closeOptions,
    posts,
    reels,
    user,
    isSaved,
    toggleSaved,
    toggleLikePost,
    toggleLikeReel,
    openComments,
    updateMedia,
    deleteMedia,
    openInsights,
    showToast,
    t,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copyrightOpen, setCopyrightOpen] = useState(false);

  useBodyScrollLock(optionsSheet.open);

  const { kind, id } = optionsSheet;
  const post = posts.find((p) => p.id === id);
  const reel = reels.find((r) => r.id === id);
  const media = kind === "reel" ? (reel ?? post) : (post ?? reel);

  useEffect(() => {
    if (!optionsSheet.open) return;
    setEditing(false);
    setConfirmDelete(false);
    setCaption(media?.caption ?? "");
    setLocation(post?.location ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsSheet.open, optionsSheet.id]);

  if (!optionsSheet.open || !media) return null;

  const saved = isSaved(kind, id);
  const liked = kind === "reel" ? (reel?.isLiked ?? post?.isLiked) : post?.isLiked;
  const isOwner = media.username === user.username;
  const key = kind === "reel" && reel?.views !== "—" ? reelKey(id) : postKey(id);

  const mediaUrl = media.mediaUrl;
  const mediaType: "image" | "video" = kind === "reel" ? "video" : (post?.mediaType ?? "video");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
      onClick={closeOptions}
    >
      <div
        data-modal-scrollable="true"
        onClick={(e) => e.stopPropagation()}
        id="reels-options-sheet"
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto max-h-[85vh] overflow-y-auto bg-[#18181b] border-t border-white/10 rounded-t-[28px] shadow-2xl text-white animate-in slide-in-from-bottom duration-250 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Options</h3>
          <button
            onClick={closeOptions}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {editing ? (
          <div className="p-4 space-y-3">
            <label className="block text-xs font-semibold text-slate-400">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-sm text-white focus:outline-none"
            />
            <label className="block text-xs font-semibold text-slate-400">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-sm text-white focus:outline-none"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-sm font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateMedia(kind, id, { caption, location });
                  showToast("Video updated");
                  closeOptions();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-sm font-bold text-white"
              >
                Save changes
              </button>
            </div>
          </div>
        ) : confirmDelete ? (
          <div className="p-5 space-y-4 text-center">
            <p className="text-sm text-white">
              Delete this {kind === "reel" ? "reel" : "post"}? This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-sm font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMedia(kind, id);
                  showToast("Deleted");
                  closeOptions();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-sm font-bold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <Row
              icon={<Bookmark className={`w-5 h-5 ${saved ? "text-white fill-slate-100" : ""}`} />}
              label={saved ? t("remove_saved") : t("save")}
              onClick={() => {
                toggleSaved({
                  kind,
                  id,
                  mediaUrl,
                  mediaType,
                  caption: media.caption,
                  username: media.username,
                });
                showToast(saved ? t("remove_saved") : t("save"));
                closeOptions();
              }}
            />
            <Row
              icon={<Heart className={`w-5 h-5 ${liked ? "text-rose-500 fill-rose-500" : ""}`} />}
              label={liked ? "Unlike video" : "Like video"}
              onClick={() => {
                if (kind === "reel") toggleLikeReel(id);
                else toggleLikePost(id);
                closeOptions();
              }}
            />
            <Row
              icon={<MessageCircle className="w-5 h-5" />}
              label={t("comments")}
              onClick={() => {
                closeOptions();
                openComments(key, media.username);
              }}
            />
            <Row
              icon={<BarChart2 className="w-5 h-5 text-pink-400" />}
              label="View Reels Insights"
              onClick={() => {
                closeOptions();
                openInsights(id);
              }}
            />
            {isOwner && (
              <>
                <Row
                  icon={<Pencil className="w-5 h-5" />}
                  label="Edit video"
                  onClick={() => setEditing(true)}
                />
                <Row
                  icon={<Trash2 className="w-5 h-5" />}
                  label="Delete video"
                  danger
                  onClick={() => setConfirmDelete(true)}
                />
              </>
            )}
            <Row
              icon={<Download className="w-5 h-5" />}
              label="Download video"
              onClick={() => {
                showToast("Preparing download...");
                void downloadWithWatermark(mediaUrl, mediaType, undefined, media.username).catch(
                  () => showToast("Download failed"),
                );
                closeOptions();
              }}
            />
            <Row
              icon={<ShieldAlert className="w-5 h-5" />}
              label="Copyright / Report"
              onClick={() => setCopyrightOpen(true)}
            />
          </div>
        )}
        <CopyrightReportModal open={copyrightOpen} onClose={() => setCopyrightOpen(false)} />
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-3.5 text-sm font-medium transition hover:bg-neutral-900 ${
        danger ? "text-rose-500" : "text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
