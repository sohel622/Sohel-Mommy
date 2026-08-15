import { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { DEFAULT_AVATAR } from "@/lib/instagram/data";
import { Stories } from "./Stories";
import { FeedPost } from "./FeedPost";
import { FeedReelsCarousel } from "./FeedReelsCarousel";
import { RightSidebar } from "./RightSidebar";

export function FeedView() {
  const { posts, user, setView, setCreatePostModalOpen, setUploadDraft, t } = useApp();

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video");
    const previewUrl = URL.createObjectURL(file);
    setUploadDraft({
      file,
      previewUrl,
      mediaType: isVideo ? "video" : "image",
    });
    // Reset file input so same file can be selected again if needed
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };

  return (
    <div
      id="feed-scroll"
      className="flex justify-center w-full gap-8 bg-white dark:bg-black h-[calc(100dvh-6rem)] md:h-[calc(100dvh-3rem)] overflow-y-auto overscroll-y-contain will-change-transform touch-pan-y scroll-smooth"
      style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
    >
      <section className="w-full max-w-[630px] flex flex-col">
        {/* Hidden File Picker for Right Photo/Gallery Button */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handlePhotoSelect}
          className="hidden"
          id="feed-photo-upload-input"
        />

        {/* 1. Facebook/Social-Style "What's on your mind?" Post Creation Bar */}
        <div
          id="feed-post-creation-bar"
          className="w-full bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800/80 px-4 py-2.5 mb-2 flex items-center gap-3"
        >
          {/* Left User Avatar -> Navigates directly to Profile View */}
          <button
            id="feed-profile-avatar-btn"
            onClick={() => setView("profile")}
            className="relative flex-shrink-0 rounded-full focus:outline-none ring-2 ring-transparent hover:ring-pink-500 transition-all duration-200"
            aria-label="View Profile"
          >
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700/60 shadow-sm"
            />
          </button>

          {/* Center Input Pill -> Opens Post Creation Modal */}
          <button
            id="feed-whats-on-mind-pill"
            type="button"
            onClick={() => setCreatePostModalOpen(true)}
            className="flex-1 flex items-center px-4 py-2.5 rounded-full bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-left transition duration-200 group shadow-sm focus:outline-none"
            aria-label={t("whats_on_your_mind")}
          >
            <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 truncate select-none">
              {t("whats_on_your_mind")}
            </span>
          </button>

          {/* Right Gallery/Photo Icon -> Direct Photo Upload Picker */}
          <button
            id="feed-photo-gallery-btn"
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 flex-shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm transition duration-200 focus:outline-none"
            title="Upload Photo/Video"
            aria-label="Upload Photo/Video"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Stories Bar (Directly below Post Bar) */}
        <Stories />

        {/* 3. Seamless Feed Posts */}
        <div
          id="posts-container"
          className="flex flex-col bg-white dark:bg-black will-change-transform"
        >
          {posts.map((p, i) => (
            <div key={p.id} className="contents">
              <FeedPost post={p} />
              {i === 1 && <FeedReelsCarousel />}
            </div>
          ))}
        </div>
      </section>
      <RightSidebar />
    </div>
  );
}
