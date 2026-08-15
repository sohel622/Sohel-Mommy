import { useState } from "react";
import { Download, Send, X } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { downloadWithWatermark } from "@/lib/instagram/download";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

export function ShareSheet() {
  const { shareSheet, closeShare, chats, showToast, user, t } = useApp();
  const [busy, setBusy] = useState(false);

  useBodyScrollLock(shareSheet.open);

  if (!shareSheet.open) return null;

  const handleDownload = async () => {
    setBusy(true);
    showToast("Downloading…");
    await downloadWithWatermark(
      shareSheet.mediaUrl,
      shareSheet.mediaType,
      (m) => showToast(m),
      user.username,
    );
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
      onClick={closeShare}
    >
      <div
        data-modal-scrollable="true"
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-[#18181b] border-t border-white/10 rounded-t-[28px] max-h-[85vh] overflow-y-auto shadow-2xl text-white animate-in slide-in-from-bottom duration-250 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800">
          <span className="w-5" />
          <h3 className="text-sm font-semibold text-slate-100">{t("share")}</h3>
          <button
            onClick={closeShare}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close share"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct message recipients */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-4">
          {chats.length === 0 && (
            <p className="text-xs text-slate-500 py-4">No people to send to yet.</p>
          )}
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => showToast(`Sent to ${c.username}`)}
              className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0 active:scale-95 transition"
            >
              <img
                src={c.avatar}
                alt={c.username}
                className="w-14 h-14 rounded-full object-cover border border-slate-700"
              />
              <span className="text-[11px] font-semibold text-white opacity-100 truncate w-full text-center">
                {c.username}
              </span>
            </button>
          ))}
        </div>

        {/* Action row: Share + Download only */}
        <div className="flex items-center gap-3 px-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ url: shareSheet.mediaUrl }).catch(() => undefined);
              } else {
                void navigator.clipboard?.writeText(shareSheet.mediaUrl);
                showToast("Link copied");
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-sm font-semibold text-slate-100 transition"
          >
            <Send className="w-4 h-4 text-pink-400" /> {t("share")}
          </button>
          <button
            onClick={handleDownload}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-sm font-semibold text-slate-100 transition disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-sky-400" /> {busy ? "Working…" : t("download")}
          </button>
        </div>
      </div>
    </div>
  );
}
