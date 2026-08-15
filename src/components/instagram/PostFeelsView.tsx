import { useState } from "react";
import { ArrowLeft, Check, Hash, Loader2, MapPin, ShoppingBag, UserPlus } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { saveToIndexedDB } from "@/lib/instagram/media";
import { registerOriginalSound } from "@/lib/instagram/audioLibrary";
import { insertPostToSupabase, uploadMediaToSupabase } from "@/lib/supabase";

export function PostFeelsView({
  mediaUrl,
  file,
  audioTrack,
  audioUrl,
  soundUrl,
  onBack,
  onDone,
}: {
  mediaUrl: string;
  file?: File | null;
  audioTrack: string;
  audioUrl?: string;
  soundUrl?: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const { setReels, setPosts, user, showToast, setView } = useApp();
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<"everyone" | "friends">("everyone");
  const [isPosting, setIsPosting] = useState(false);

  const publish = async () => {
    setIsPosting(true);
    showToast("Posting to Supabase...");

    let finalMediaUrl = mediaUrl;
    if (file) {
      const supabaseUrl = await uploadMediaToSupabase(file, "reels");
      if (supabaseUrl) {
        finalMediaUrl = supabaseUrl;
      }
    }

    const id = Date.now();
    const bgAudio = audioUrl || soundUrl || undefined;

    // Save record to Supabase database 'posts' table
    await insertPostToSupabase({
      username: user.username,
      user_avatar: user.avatar,
      media_url: finalMediaUrl,
      media_type: "video",
      kind: "reel",
      caption: caption.trim() || "New feels",
      likes: 0,
      audio_track: audioTrack || "Original Audio",
    });

    const reelItem = {
      id,
      username: user.username,
      userAvatar: user.avatar,
      mediaUrl: finalMediaUrl,
      caption: caption.trim() || "New feels",
      audioTrack: audioTrack || "Original Audio",
      audioUrl: bgAudio,
      soundUrl: bgAudio,
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
      mediaUrl: finalMediaUrl,
      mediaType: "video" as const,
      likes: 0,
      isLiked: false,
      isBookmarked: false,
      caption: caption.trim() || "New feels",
      timeAgo: "JUST NOW",
      comments: [],
      audioTrack: audioTrack || "Original Audio",
      audioUrl: bgAudio,
      soundUrl: bgAudio,
    };
    setPosts((prev) => [postItem, ...prev]);

    // Extract the uploaded reel's original sound into the shared music library.
    void registerOriginalSound({ id, mediaUrl: finalMediaUrl, creator: user.username });
    if (file) {
      void saveToIndexedDB({ id, kind: "reel", payload: reelItem, fileBlob: file, createdAt: id });
    }
    setIsPosting(false);
    showToast("Feels posted to Supabase!");
    onDone();
    setView("feed");
  };

  return (
    <div className="fixed inset-0 z-[1005] bg-black text-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900">
        <button onClick={onBack} aria-label="Back">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-base font-semibold">Post feels</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        <div className="flex gap-3">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            placeholder="Video caption..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
          />
          <div className="w-24 shrink-0">
            <div className="w-24 h-32 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              {mediaUrl ? (
                <video
                  src={mediaUrl}
                  muted
                  playsInline
                  preload="auto"
                  onError={(e) => {
                    e.preventDefault();
                  }}
                  className="w-full h-full object-cover transform-gpu translate-z-0"
                  style={{ transform: "translateZ(0)" }}
                />
              ) : null}
            </div>
            <p className="mt-1 text-[10px] text-zinc-500 leading-tight">Video ready to upload</p>
            <button className="text-[10px] font-semibold text-pink-500">Change cover</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { icon: <Hash className="w-3.5 h-3.5" />, label: "Hashtags" },
            { icon: <MapPin className="w-3.5 h-3.5" />, label: "Add Location" },
            { icon: <UserPlus className="w-3.5 h-3.5" />, label: "Tag People" },
            { icon: <ShoppingBag className="w-3.5 h-3.5" />, label: "Tag Hoppi Product" },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => showToast(`${c.label} coming soon`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200"
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Who can watch</p>
          {(
            [
              { key: "everyone", title: "Everyone", sub: "Anyone on Tweetgram can see this" },
              { key: "friends", title: "Friends", sub: "Only people you follow back" },
            ] as const
          ).map((a) => (
            <button
              key={a.key}
              onClick={() => setAudience(a.key)}
              className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                audience === a.key ? "border-pink-600 bg-zinc-900" : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-white">{a.title}</span>
                <span className="block text-xs text-zinc-500">{a.sub}</span>
              </span>
              {audience === a.key && <Check className="w-5 h-5 text-pink-500" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={publish}
          disabled={isPosting}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPosting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Posting to Supabase...</span>
            </>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </div>
  );
}
