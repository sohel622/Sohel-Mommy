import { useMemo, useState } from "react";
import { Heart, Pin, X } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

const QUICK_EMOJIS = ["❤️", "🔥", "😂", "🙌", "😍"];

export function CommentSheet() {
  const {
    commentSheet,
    closeComments,
    commentsByKey,
    addCommentTo,
    toggleCommentLike,
    toggleCommentPin,
    user,
    t,
  } = useApp();
  const [text, setText] = useState("");

  useBodyScrollLock(commentSheet.open);

  const list = useMemo(() => {
    const items = commentsByKey[commentSheet.key] ?? [];
    return [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [commentsByKey, commentSheet.key]);

  if (!commentSheet.open) return null;

  const isOwner = commentSheet.ownerUsername === user.username;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addCommentTo(commentSheet.key, text.trim());
    setText("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
      onClick={closeComments}
    >
      <div
        data-modal-scrollable="true"
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto h-[65vh] max-h-[85vh] bg-[#18181b] border-t border-white/10 rounded-t-[28px] shadow-2xl flex flex-col text-white animate-in slide-in-from-bottom duration-250 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] overflow-hidden"
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800">
          <span className="w-5" />
          <h3 className="text-sm font-semibold text-slate-100">
            {t("comments")} {list.length > 0 && `(${list.length})`}
          </h3>
          <button
            onClick={closeComments}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          {list.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-10">
              No comments yet. Start the conversation.
            </p>
          )}
          {list.map((c) => (
            <div key={c.id} className="flex gap-3">
              <img
                src={c.avatar}
                alt={c.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {c.pinned && (
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                    <Pin className="w-3 h-3" /> Pinned by creator
                  </p>
                )}
                <p className="text-sm text-slate-100">
                  <span className="font-semibold mr-2">{c.username}</span>
                  <span className="text-slate-300">{c.text}</span>
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[11px] text-slate-500">
                    {c.likes} like{c.likes === 1 ? "" : "s"}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => toggleCommentPin(commentSheet.key, c.id)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-100"
                    >
                      {c.pinned ? "Unpin" : "Pin"}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleCommentLike(commentSheet.key, c.id)}
                aria-label="Like comment"
                className="self-start pt-1"
              >
                <Heart
                  className={`w-4 h-4 ${
                    c.isLiked ? "text-rose-500 fill-rose-500" : "text-slate-400"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 px-3 pt-2 pb-3 space-y-2">
          <div className="flex items-center gap-4 px-1">
            {QUICK_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setText((t) => t + e)}
                className="text-xl leading-none"
                aria-label={`Add ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("add_comment")}
              className="flex-1 bg-slate-900 rounded-full px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="text-sm font-semibold text-sky-400 disabled:text-sky-800"
            >
              {t("posts")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
