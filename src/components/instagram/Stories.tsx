import { useRef } from "react";
import { Plus, Check } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { DEFAULT_AVATAR } from "@/lib/instagram/data";

export function Stories() {
  const { stories, user, openStoryViewer, showToast, setUploadDraft, t } = useApp();
  const storyInputRef = useRef<HTMLInputElement>(null);

  const handleStoryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video");
    const previewUrl = URL.createObjectURL(file);
    setUploadDraft({
      file,
      previewUrl,
      mediaType: isVideo ? "video" : "image",
    });
    showToast("Story draft ready to publish");
  };

  return (
    <div
      id="stories-bar"
      className="w-full bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 min-h-[105px] flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth"
    >
      <input
        ref={storyInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleStoryFile}
        className="hidden"
        id="story-file-picker"
      />

      {/* 1. First Item: Current User's "Create Story" */}
      <button
        id="create-story-btn"
        onClick={() => {
          if (storyInputRef.current) {
            storyInputRef.current.click();
          } else {
            showToast(t("create_story"));
          }
        }}
        className="flex flex-col items-center space-y-1.5 flex-shrink-0 group focus:outline-none"
        aria-label={t("create_story")}
      >
        <div className="relative w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-pink-500/60 group-hover:border-pink-500 transition">
          <img
            src={user.avatar || DEFAULT_AVATAR}
            alt="Your avatar"
            className="w-full h-full rounded-full object-cover group-hover:scale-105 transition duration-200"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md group-hover:scale-110 transition">
            <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate max-w-[72px]">
          {t("create_story")}
        </span>
      </button>

      {/* 2. Other Users' Stories */}
      {stories.map((s, i) => (
        <button
          key={s.id}
          id={`story-item-${s.id}`}
          onClick={() => openStoryViewer(i)}
          className="flex flex-col items-center space-y-1.5 flex-shrink-0 group focus:outline-none"
          aria-label={`${s.username}'s story`}
        >
          <div
            className={`p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 ${
              s.hasUnseen
                ? "bg-gradient-to-tr from-amber-400 via-pink-600 to-purple-600 shadow-sm"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div className="p-[2px] bg-white dark:bg-slate-950 rounded-full">
              <img
                src={s.avatar || DEFAULT_AVATAR}
                alt={s.username}
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
          </div>
          <div className="flex items-center gap-0.5 max-w-[72px] justify-center">
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
              {s.username}
            </span>
            <span
              className="w-3 h-3 rounded-full bg-sky-500 flex items-center justify-center shrink-0"
              title="Verified Creator"
            >
              <Check className="w-2 h-2 text-white stroke-[3]" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
