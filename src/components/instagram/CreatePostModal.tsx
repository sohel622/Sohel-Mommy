import { useState, useRef, ChangeEvent } from "react";
import {
  X,
  Image as ImageIcon,
  Smile,
  MapPin,
  Globe,
  Users,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { insertPostToSupabase, uploadMediaToSupabase } from "@/lib/supabase";
import { saveToIndexedDB } from "@/lib/instagram/media";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

const BG_PRESETS = [
  { id: "default", label: "Default", class: "bg-transparent text-slate-100" },
  {
    id: "sunset",
    label: "Sunset",
    class:
      "bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 text-white font-bold text-center",
  },
  {
    id: "ocean",
    label: "Ocean",
    class:
      "bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-bold text-center",
  },
  {
    id: "aurora",
    label: "Aurora",
    class:
      "bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-300 text-white font-bold text-center",
  },
  {
    id: "fire",
    label: "Fire",
    class:
      "bg-gradient-to-tr from-red-600 via-orange-600 to-yellow-500 text-white font-bold text-center",
  },
  {
    id: "royal",
    label: "Royal",
    class:
      "bg-gradient-to-tr from-purple-700 via-violet-600 to-pink-500 text-white font-bold text-center",
  },
  {
    id: "midnight",
    label: "Midnight",
    class:
      "bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white font-bold text-center border border-slate-700/60",
  },
];

const FEELING_EMOJIS = [
  { emoji: "😊", label: "happy" },
  { emoji: "💖", label: "loved" },
  { emoji: "🥳", label: "celebrating" },
  { emoji: "🔥", label: "excited" },
  { emoji: "☕", label: "relaxed" },
  { emoji: "🚀", label: "focused" },
  { emoji: "✨", label: "blessed" },
  { emoji: "🎧", label: "listening to music" },
  { emoji: "🍕", label: "eating delicious food" },
];

export function CreatePostModal() {
  const { createPostModalOpen, setCreatePostModalOpen, user, setPosts, showToast, t } = useApp();

  const [text, setText] = useState("");
  const [selectedBg, setSelectedBg] = useState("default");
  const [audience, setAudience] = useState<"public" | "friends">("public");
  const [showFeelings, setShowFeelings] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<{ emoji: string; label: string } | null>(
    null,
  );
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [location, setLocation] = useState("");

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock(createPostModalOpen);

  if (!createPostModalOpen) return null;

  const handleClose = () => {
    if (isPosting) return;
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setText("");
    setSelectedBg("default");
    setSelectedFeeling(null);
    setShowFeelings(false);
    setShowLocationInput(false);
    setLocation("");
    setMediaFile(null);
    setMediaPreview(null);
    setCreatePostModalOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video");
    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview(previewUrl);
    setMediaType(isVid ? "video" : "image");
    setSelectedBg("default");
  };

  const removeMedia = () => {
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = async () => {
    const trimmed = text.trim();
    if (!trimmed && !mediaFile && !mediaPreview) {
      showToast("Please enter some text or select a photo");
      return;
    }

    setIsPosting(true);
    showToast("Publishing post...");

    let finalMediaUrl = mediaPreview || "";
    if (mediaFile) {
      const uploadedUrl = await uploadMediaToSupabase(mediaFile, "posts");
      if (uploadedUrl) {
        finalMediaUrl = uploadedUrl;
      }
    }

    const postId = Date.now();
    let fullCaption = trimmed;
    if (selectedFeeling) {
      fullCaption = `${fullCaption ? fullCaption + " " : ""}— feeling ${selectedFeeling.emoji} ${selectedFeeling.label}`;
    }

    const newPost = {
      id: postId,
      username: user.username,
      userAvatar: user.avatar,
      location: location.trim() || user.location || "",
      mediaUrl: finalMediaUrl,
      mediaType: mediaType,
      likes: 0,
      isLiked: false,
      isBookmarked: false,
      caption: fullCaption,
      timeAgo: "JUST NOW",
      comments: [],
    };

    // Save to Supabase
    await insertPostToSupabase({
      username: user.username,
      user_avatar: user.avatar,
      media_url: finalMediaUrl,
      media_type: mediaType,
      kind: "post",
      caption: fullCaption,
      likes: 0,
      location: location.trim() || user.location || "",
    });

    // Save to IndexedDB if local file exists
    if (mediaFile) {
      void saveToIndexedDB({
        id: postId,
        kind: "post",
        payload: newPost,
        fileBlob: mediaFile,
        createdAt: postId,
      });
    }

    // Optimistically update feed at top
    setPosts((prev) => [newPost, ...prev]);

    setIsPosting(false);
    showToast("Post shared successfully!");
    handleClose();
  };

  const currentBgObj = BG_PRESETS.find((b) => b.id === selectedBg) || BG_PRESETS[0];
  const isColoredBg = selectedBg !== "default" && !mediaPreview;

  return (
    <div
      id="create-post-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 touch-none overscroll-none animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="create-post-modal-card"
        data-modal-scrollable="true"
        className="w-full max-w-lg bg-[#18181b] border border-white/10 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-4 py-3.5 border-b border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-100">{t("create_post")}</h2>
          <button
            onClick={handleClose}
            disabled={isPosting}
            className="absolute right-3.5 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* User Info & Audience */}
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-slate-100 truncate">
                  {user.fullName || user.username}
                </span>
                {selectedFeeling && (
                  <span className="text-xs text-slate-400">
                    is feeling {selectedFeeling.emoji} {selectedFeeling.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setAudience((a) => (a === "public" ? "friends" : "public"))}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-medium text-slate-300 transition"
                >
                  {audience === "public" ? (
                    <>
                      <Globe className="w-3 h-3 text-sky-400" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>Friends</span>
                    </>
                  )}
                </button>
                {location && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-pink-400 truncate max-w-[140px]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Text Input Area */}
          <div
            className={`rounded-xl transition-all duration-200 ${
              isColoredBg
                ? `${currentBgObj.class} p-6 min-h-[160px] flex items-center justify-center shadow-inner`
                : "bg-slate-950/60 border border-slate-800/80 p-3 min-h-[110px]"
            }`}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("whats_on_your_mind")}
              rows={isColoredBg ? 3 : 4}
              className={`w-full bg-transparent resize-none focus:outline-none placeholder-slate-500 leading-relaxed ${
                isColoredBg
                  ? "text-xl sm:text-2xl font-extrabold text-center text-white placeholder-white/70"
                  : "text-sm sm:text-base text-slate-100 placeholder-slate-500"
              }`}
            />
          </div>

          {/* Background Gradient Selector (Only if no media is selected) */}
          {!mediaPreview && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Theme:
              </span>
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedBg(preset.id)}
                  title={preset.label}
                  className={`w-7 h-7 rounded-lg shrink-0 transition-transform active:scale-95 border-2 ${
                    preset.id === "default" ? "bg-slate-800 border-slate-600" : preset.class
                  } ${
                    selectedBg === preset.id
                      ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-900 scale-110"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Media Attachment Preview */}
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black max-h-72 flex items-center justify-center">
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition"
                aria-label="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              {mediaType === "video" ? (
                <video
                  src={mediaPreview}
                  controls
                  playsInline
                  className="w-full max-h-72 object-contain"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Post preview"
                  className="w-full max-h-72 object-contain"
                />
              )}
            </div>
          )}

          {/* Location Input Accordion */}
          {showLocationInput && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 animate-fade-in">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you? (e.g. New York, Dhaka, Tokyo)"
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation("")}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Feelings / Emotion Picker Tray */}
          {showFeelings && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {t("feeling_activity")}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFeelings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                {FEELING_EMOJIS.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => {
                      setSelectedFeeling(selectedFeeling?.label === f.label ? null : f);
                      setShowFeelings(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      selectedFeeling?.label === f.label
                        ? "bg-pink-600/30 border-pink-500 text-pink-200"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{f.emoji}</span>
                    <span className="capitalize">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Facebook-style "Add to your post" toolbar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/90">
            <span className="text-xs font-semibold text-slate-300">{t("add_to_your_post")}</span>
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="create-post-file-input"
              />
              {/* Photo / Video Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Photo / Video"
                className="p-2 rounded-full hover:bg-slate-800 text-emerald-400 transition"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Feelings Button */}
              <button
                type="button"
                onClick={() => setShowFeelings((v) => !v)}
                title="Feeling / Activity"
                className="p-2 rounded-full hover:bg-slate-800 text-amber-400 transition"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Location Button */}
              <button
                type="button"
                onClick={() => setShowLocationInput((v) => !v)}
                title="Add Location"
                className="p-2 rounded-full hover:bg-slate-800 text-rose-400 transition"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer / Post Action Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPosting || (!text.trim() && !mediaFile && !mediaPreview)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{t("sharing")}</span>
              </>
            ) : (
              <span>{t("post")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
