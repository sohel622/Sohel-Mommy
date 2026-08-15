import { useEffect, useRef, useState } from "react";
import { Loader2, Music2, Pause, Play, Plus, Search, Sparkles, X } from "lucide-react";
import {
  addTrack,
  formatSeconds,
  useAudioLibrary,
  type AudioTrack,
} from "@/lib/instagram/audioLibrary";
import {
  searchYouTubeMusic,
  ytPause,
  ytPlay,
  ytProgress,
  ytResume,
  ytSeek,
  ytStop,
} from "@/lib/instagram/youtube";
import { AudioTrimmerView } from "./AudioTrimmerView";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

export type { AudioTrack };

interface FeaturedBanner {
  id: string;
  youtubeId?: string;
  title: string;
  artist: string;
  tag: string;
  cover: string;
  gradient: string;
}

const FEATURED_BANNERS: FeaturedBanner[] = [
  {
    id: "b1",
    youtubeId: "kJQP7kiw5Fk",
    title: "Despacito (Remix)",
    artist: "Luis Fonsi ft. Daddy Yankee",
    tag: "🔥 VIRAL TRENDING #1",
    cover: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    gradient: "from-amber-600/90 via-rose-700/80 to-zinc-950",
  },
  {
    id: "b2",
    youtubeId: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    tag: "⚡ REELS TOP 10",
    cover: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg",
    gradient: "from-blue-600/90 via-indigo-800/80 to-zinc-950",
  },
  {
    id: "b3",
    youtubeId: "papuvlVeZg8",
    title: "Kesariya - Brahmastra",
    artist: "Pritam & Arijit Singh",
    tag: "✨ HINDI CHARTBUSTER",
    cover: "https://i.ytimg.com/vi/papuvlVeZg8/hqdefault.jpg",
    gradient: "from-pink-600/90 via-purple-800/80 to-zinc-950",
  },
  {
    id: "b4",
    youtubeId: "OPf0YbXqDm0",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    tag: "🎧 RETRO FUNK VIBES",
    cover: "https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg",
    gradient: "from-emerald-600/90 via-teal-800/80 to-zinc-950",
  },
];

const CATEGORIES = [
  { label: "🔥 All", query: "" },
  { label: "🪕 Punjabi", query: "punjabi viral hits" },
  { label: "⚡ Viral", query: "reels viral music" },
  { label: "🎧 Phonk", query: "drift phonk remix" },
  { label: "🌙 Lo-Fi", query: "lofi chill beats" },
];

export function AudioPickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (track: AudioTrack) => void;
}) {
  useBodyScrollLock(open);
  const library = useAudioLibrary();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("🔥 All");
  const [results, setResults] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [active, setActive] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [bannerIdx, setBannerIdx] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    void ytStop();
    setPlaying(false);
    setActive(null);
    setEditing(false);
  };

  useEffect(() => {
    if (!open) stopPreview();
  }, [open]);

  useEffect(() => () => stopPreview(), []);

  // Auto-scroll banner carousel every 4 seconds
  useEffect(() => {
    if (!open || isBannerPaused) return;
    const t = window.setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % FEATURED_BANNERS.length);
    }, 4000);
    return () => window.clearInterval(t);
  }, [open, isBannerPaused]);

  // Track playback position for editor timeline
  useEffect(() => {
    if (!active?.youtubeId || !playing) return;
    const id = window.setInterval(() => setProgress(ytProgress()), 250);
    return () => window.clearInterval(id);
  }, [active, playing]);

  useEffect(() => {
    if (!active?.src || !playing) return;
    const id = window.setInterval(() => {
      const a = audioRef.current;
      if (a) setProgress({ current: a.currentTime, duration: a.duration || 0 });
    }, 250);
    return () => window.clearInterval(id);
  }, [active, playing]);

  // Live YouTube search (debounced & cached)
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    const t = window.setTimeout(
      () => {
        searchYouTubeMusic(query, controller.signal)
          .then((list) => {
            setResults(list);
            setLoading(false);
          })
          .catch(() => {
            if (controller.signal.aborted) return;
            setLoading(false);
          });
      },
      query ? 400 : 0,
    );
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [open, query]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const mine = library.filter((t) => `${t.title} ${t.artist}`.toLowerCase().includes(q));

  const play = (t: AudioTrack, from = 0) => {
    audioRef.current?.pause();
    audioRef.current = null;
    void ytStop();
    setActive(t);
    setProgress({ current: from, duration: 0 });
    if (t.youtubeId) {
      void ytPlay(t.youtubeId, from);
    } else {
      const audioSrc = getTrackAudioSrc(t);
      if (audioSrc) {
        const a = new Audio();
        a.onerror = (e) => e.preventDefault();
        a.volume = 1.0;
        a.src = audioSrc;
        a.currentTime = from;
        audioRef.current = a;
        void a.play().catch(() => undefined);
        a.onended = () => setPlaying(false);
      }
    }
    setPlaying(true);
  };

  const togglePlay = () => {
    if (!active) return;
    if (playing) {
      if (active.youtubeId) ytPause();
      else audioRef.current?.pause();
      setPlaying(false);
    } else if (active.youtubeId) {
      void ytResume();
      setPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.volume = 1.0;
      void audioRef.current.play().catch(() => undefined);
      setPlaying(true);
    } else {
      play(active);
    }
  };

  const seek = (s: number) => {
    if (!active) return;
    if (active.youtubeId) ytSeek(s);
    else if (audioRef.current) audioRef.current.currentTime = s;
    setProgress((p) => ({ ...p, current: s }));
  };

  const openEditor = (t: AudioTrack) => {
    if (active?.id !== t.id) play(t);
    setEditing(true);
  };

  const applyTrack = (t: AudioTrack, startAt = 0) => {
    stopPreview();
    onSelect({ ...t, startAt });
    onClose();
  };

  const selectBanner = (b: FeaturedBanner) => {
    const track: AudioTrack = {
      id: `banner-${b.id}`,
      youtubeId: b.youtubeId,
      title: b.title,
      artist: b.artist,
      cover: b.cover,
    };
    play(track);
  };

  const selectCategory = (c: (typeof CATEGORIES)[number]) => {
    setActiveCategory(c.label);
    setQuery(c.query);
  };

  const currentBanner = FEATURED_BANNERS[bannerIdx]!;

  const row = (t: AudioTrack) => (
    <div key={t.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-900/50 transition">
      <button
        onClick={() => openEditor(t)}
        className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-pink-600 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-md"
        aria-label={`Open ${t.title}`}
      >
        {t.cover && (
          <img
            src={t.cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <span className="relative z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
          {active?.id === t.id && playing ? (
            <Pause className="w-3.5 h-3.5 text-white" />
          ) : (
            <Play className="w-3.5 h-3.5 text-white ml-0.5" />
          )}
        </span>
      </button>
      <button onClick={() => openEditor(t)} className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-white line-clamp-1">{t.title}</p>
        <p className="text-xs text-zinc-400 truncate">
          {t.artist}
          {t.duration ? ` • ${t.duration}` : ""}
        </p>
      </button>
      <button
        onClick={() => applyTrack(t)}
        className="w-8 h-8 shrink-0 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center transition shadow"
        aria-label={`Use ${t.title}`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] w-full h-full bg-zinc-950 flex flex-col overflow-hidden animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-2.5 border-b border-zinc-800/80 shrink-0">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          Add Sound
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadOpen(true)}
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20"
            aria-label="Upload custom track"
          >
            <Plus className="w-4 h-4" /> Upload
          </button>
          <button
            onClick={onClose}
            aria-label="Close music picker"
            className="p-1 rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveCategory("🔥 All");
            }}
            placeholder="Search songs, artists, or movies..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />}
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-4">
        {/* Top Trending Auto-Scrolling Banners */}
        {!query && (
          <div
            className="px-5 pt-1"
            onMouseEnter={() => setIsBannerPaused(true)}
            onMouseLeave={() => setIsBannerPaused(false)}
            onTouchStart={() => setIsBannerPaused(true)}
            onTouchEnd={() => setIsBannerPaused(false)}
          >
            <div
              onClick={() => selectBanner(currentBanner)}
              className={`relative rounded-2xl p-4 bg-gradient-to-r ${currentBanner.gradient} border border-white/10 overflow-hidden cursor-pointer shadow-lg transition-all duration-500 flex items-center gap-4`}
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xl shrink-0">
                <img src={currentBanner.cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  {currentBanner.tag}
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-1">{currentBanner.title}</h4>
                <p className="text-xs text-zinc-300 truncate">{currentBanner.artist}</p>
                <p className="text-[10px] text-pink-300 font-medium">Tap to preview sound →</p>
              </div>
            </div>

            {/* Carousel Pagination Dots */}
            <div className="flex justify-center items-center gap-1.5 mt-2">
              {FEATURED_BANNERS.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setBannerIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === bannerIdx ? "w-5 bg-pink-500" : "w-1.5 bg-zinc-700"
                  }`}
                  aria-label={`Go to banner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Category Buttons */}
        <div className="px-5 flex gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => selectCategory(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeCategory === c.label
                  ? "bg-pink-600 border-pink-500 text-white shadow-md"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* User Custom Sounds */}
        {mine.length > 0 && (
          <div>
            <p className="px-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Your Sounds
            </p>
            {mine.map(row)}
          </div>
        )}

        {/* Main Song List or Skeleton Shimmers */}
        <div>
          <p className="px-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            {query.trim() ? "Search Results" : "Trending on YouTube"}
          </p>

          {loading ? (
            /* Animated Grey Skeleton Shimmer Loaders */
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800/80 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 bg-zinc-800/80 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-800/60 rounded w-1/2" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {results.map(row)}
              {results.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-zinc-500">
                  <Music2 className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
                  No tracks found for "{query}"
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Mini Player */}
      {active && (
        <div className="border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => setEditing(true)}
            className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center shadow"
            aria-label="Open editor"
          >
            {active.cover ? (
              <img src={active.cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <Music2 className="w-4 h-4 text-zinc-400" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{active.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{active.artist}</p>
          </div>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center text-white shrink-0 shadow"
            aria-label={playing ? "Pause preview" : "Play preview"}
          >
            {playing ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            )}
          </button>
          <button
            onClick={() => applyTrack(active, progress.current)}
            className="px-3 py-1.5 rounded-full bg-pink-600 text-xs font-bold text-white shrink-0 shadow"
          >
            Use
          </button>
          <button
            onClick={stopPreview}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white shrink-0"
            aria-label="Stop preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {editing && active && (
        <div onClick={(e) => e.stopPropagation()}>
          <AudioTrimmerView
            track={active}
            playing={playing}
            duration={progress.duration}
            current={progress.current}
            onTogglePlay={togglePlay}
            onSeek={seek}
            onClose={() => setEditing(false)}
            onDone={(startAt) => applyTrack(active, startAt)}
          />
        </div>
      )}

      {uploadOpen && <UploadTrackModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}

function UploadTrackModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audio, setAudio] = useState<{ url: string; name: string; duration: string } | null>(null);
  const [cover, setCover] = useState<string | undefined>();

  const pickAudio = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.onerror = (e) => e.preventDefault();
    a.src = url;
    a.onloadedmetadata = () =>
      setAudio({ url, name: file.name, duration: formatSeconds(a.duration) });
    setAudio({ url, name: file.name, duration: "0:00" });
  };

  const pickCover = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCover(String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!audio) return;
    addTrack({
      id: Date.now(),
      title: title.trim() || audio.name.replace(/\.[^.]+$/, ""),
      artist: artist.trim() || "You",
      duration: audio.duration,
      src: audio.url,
      cover,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1010] flex items-end bg-black/70" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-zinc-950 border-t border-zinc-800 rounded-t-3xl animate-slide-up p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Upload Custom Track</h3>
          <button onClick={onClose} aria-label="Close upload">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <label className="flex items-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 cursor-pointer">
          <Music2 className="w-4 h-4 text-pink-500" />
          <span className="text-sm text-zinc-300 truncate">
            {audio ? audio.name : "Choose audio file (MP3)"}
          </span>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickAudio(f);
            }}
          />
        </label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        <input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist name"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <span className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            {cover ? (
              <img src={cover} alt="Track cover" className="w-full h-full object-cover" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </span>
          <span className="text-sm text-zinc-400">Add cover thumbnail</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickCover(f);
            }}
          />
        </label>

        <button
          onClick={save}
          disabled={!audio}
          className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
        >
          Save to your sounds
        </button>
      </div>
    </div>
  );
}
