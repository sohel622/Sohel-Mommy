import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { saveToIndexedDB } from "@/lib/instagram/media";
import { insertPostToSupabase, uploadMediaToSupabase } from "@/lib/supabase";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

const BANNED_WORDS = [
  "18+",
  "nsfw",
  "explicit",
  "nude",
  "porn",
  "adult",
  "violence",
  "gore",
  "naked",
  "sex",
];

export function UploadModal() {
  const {
    uploadDraft,
    setUploadDraft,
    setPosts,
    setReels,
    setStories,
    user,
    showToast,
    setBanned,
    t,
  } = useApp();
  const [category, setCategory] = useState<"post" | "reel" | "story">("post");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useBodyScrollLock(!!uploadDraft);

  if (!uploadDraft) return null;

  const close = () => {
    URL.revokeObjectURL(uploadDraft.previewUrl);
    setUploadDraft(null);
    setCaption("");
    setLocation("");
    setCategory("post");
    setIsUploading(false);
  };

  const publish = async () => {
    const scanText = `${caption} ${location} ${uploadDraft.file.name}`.toLowerCase();
    if (BANNED_WORDS.some((w) => scanText.includes(w))) {
      document.querySelectorAll("video").forEach((v) => v.pause());
      setBanned(true);
      close();
      return;
    }

    setIsUploading(true);
    showToast("Uploading to Supabase...");

    // Upload file to Supabase Storage 'media' bucket
    const supabaseMediaUrl = await uploadMediaToSupabase(uploadDraft.file, category);
    const finalMediaUrl = supabaseMediaUrl || uploadDraft.previewUrl;

    const id = Date.now();

    // Insert record into Supabase Database 'posts' table
    await insertPostToSupabase({
      username: user.username,
      user_avatar: user.avatar,
      media_url: finalMediaUrl,
      media_type: uploadDraft.mediaType,
      kind: category,
      caption,
      location,
      likes: 0,
      audio_track:
        uploadDraft.mediaType === "video" ? `Original Audio - ${user.username}` : undefined,
    });

    if (category === "post") {
      const item = {
        id,
        username: user.username,
        userAvatar: user.avatar,
        location,
        mediaUrl: finalMediaUrl,
        mediaType: uploadDraft.mediaType,
        likes: 0,
        isLiked: false,
        isBookmarked: false,
        caption,
        timeAgo: "JUST NOW",
        comments: [],
        audioTrack:
          uploadDraft.mediaType === "video" ? `Original Audio - ${user.username}` : undefined,
        audioUrl: uploadDraft.mediaType === "video" ? finalMediaUrl : undefined,
        soundUrl: uploadDraft.mediaType === "video" ? finalMediaUrl : undefined,
      };
      setPosts((prev) => [item, ...prev]);

      if (uploadDraft.mediaType === "video") {
        const reelItem = {
          id: id + 1,
          username: user.username,
          userAvatar: user.avatar,
          mediaUrl: finalMediaUrl,
          caption,
          audioTrack: `Original Audio - ${user.username}`,
          audioUrl: finalMediaUrl,
          soundUrl: finalMediaUrl,
          likes: 0,
          commentsCount: 0,
          isLiked: false,
          views: "0",
          isCurrentUser: true,
        };
        setReels((prev) => [reelItem, ...prev]);
      }

      void saveToIndexedDB({
        id,
        kind: "post",
        payload: item,
        fileBlob: uploadDraft.file,
        createdAt: id,
      });
    } else if (category === "reel") {
      const reelItem = {
        id,
        username: user.username,
        userAvatar: user.avatar,
        mediaUrl: finalMediaUrl,
        caption,
        audioTrack: `Original Audio - ${user.username}`,
        audioUrl: finalMediaUrl,
        soundUrl: finalMediaUrl,
        likes: 0,
        commentsCount: 0,
        isLiked: false,
        views: "0",
        isCurrentUser: true,
      };
      setReels((prev) => [reelItem, ...prev]);

      const postItem = {
        id,
        username: user.username,
        userAvatar: user.avatar,
        location,
        mediaUrl: finalMediaUrl,
        mediaType: "video" as const,
        likes: 0,
        isLiked: false,
        isBookmarked: false,
        caption,
        timeAgo: "JUST NOW",
        comments: [],
        audioTrack: `Original Audio - ${user.username}`,
        audioUrl: finalMediaUrl,
        soundUrl: finalMediaUrl,
      };
      setPosts((prev) => [postItem, ...prev]);

      void saveToIndexedDB({
        id,
        kind: "reel",
        payload: reelItem,
        fileBlob: uploadDraft.file,
        createdAt: id,
      });
    } else {
      const item = {
        id,
        username: user.username,
        avatar: user.avatar,
        mediaUrl: finalMediaUrl,
        mediaType: uploadDraft.mediaType,
        hasUnseen: true,
      };
      setStories((prev) => [item, ...prev]);
      void saveToIndexedDB({
        id,
        kind: "story",
        payload: item,
        fileBlob: uploadDraft.file,
        createdAt: id,
      });
    }

    setIsUploading(false);
    showToast(
      `${category === "post" ? "Post" : category === "reel" ? "Reel" : "Story"} shared to Supabase!`,
    );
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 touch-none overscroll-none animate-fade-in">
      <div
        data-modal-scrollable="true"
        className="bg-[#18181b] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/10"
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800">
          <button
            onClick={close}
            disabled={isUploading}
            className="text-slate-400 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-center text-base text-slate-100">
            {t("create_new_content")}
          </h3>
          <button
            onClick={publish}
            disabled={isUploading}
            className="text-sky-400 hover:text-sky-300 font-bold text-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>{t("sharing")}</span>
              </>
            ) : (
              t("share")
            )}
          </button>
        </div>

        <div className="relative bg-black w-full h-64 sm:h-80 flex items-center justify-center overflow-hidden">
          {uploadDraft.mediaType === "image" ? (
            uploadDraft.previewUrl ? (
              <img
                src={uploadDraft.previewUrl}
                className="max-h-full max-w-full object-contain"
                alt="Preview"
              />
            ) : null
          ) : uploadDraft.previewUrl ? (
            <video
              src={uploadDraft.previewUrl}
              controls
              playsInline
              onError={(e) => {
                e.preventDefault();
              }}
              className="max-h-full max-w-full"
            />
          ) : null}
        </div>

        <div className="flex justify-around border-b border-slate-800 bg-slate-900/60 text-sm font-semibold">
          {(["post", "reel", "story"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-1 py-3 text-center border-b-2 capitalize ${
                category === c
                  ? "border-pink-500 text-pink-500 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-100"
              }`}
            >
              {c === "reel" ? "Reels" : c}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Write a caption... (Type '18+' or 'explicit' to test AI Safety Auto-Ban)"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, California"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
