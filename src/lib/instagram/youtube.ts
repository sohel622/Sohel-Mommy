import type { AudioTrack } from "./audioLibrary";

const API_KEY = import.meta.env["VITE_YOUTUBE_API_KEY"] as string | undefined;
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

interface YtItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

/* ---------- Cache + curated fallback ---------- */

const CACHE_PREFIX = "yt-music-cache:";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

function cacheKey(q: string) {
  return `${CACHE_PREFIX}${q.trim().toLowerCase() || "__trending__"}`;
}

function readCache(q: string): AudioTrack[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(q));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; tracks: AudioTrack[] };
    if (!parsed?.tracks?.length) return null;
    if (Date.now() - parsed.at > CACHE_TTL) return null;
    return parsed.tracks;
  } catch {
    return null;
  }
}

function writeCache(q: string, tracks: AudioTrack[]) {
  try {
    localStorage.setItem(cacheKey(q), JSON.stringify({ at: Date.now(), tracks }));
  } catch {
    /* storage full / unavailable */
  }
}

export function isValidYouTubeId(id?: string): boolean {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id.trim());
}

const yt = (id: string, title: string, artist: string): AudioTrack => ({
  id: `yt-${id}`,
  youtubeId: id,
  title,
  artist,
  cover: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
});

/** Curated evergreen tracks used when the API is unavailable or quota-limited. */
export const FALLBACK_TRACKS: AudioTrack[] = [
  yt("kJQP7kiw5Fk", "Luis Fonsi - Despacito ft. Daddy Yankee", "Luis Fonsi"),
  yt("JGwWNGJdvx8", "Ed Sheeran - Shape of You", "Ed Sheeran"),
  yt("RgKAFK5djSk", "Wiz Khalifa - See You Again ft. Charlie Puth", "Wiz Khalifa"),
  yt("OPf0YbXqDm0", "Mark Ronson - Uptown Funk ft. Bruno Mars", "Mark Ronson"),
  yt("CevxZvSJLk8", "Katy Perry - Roar", "Katy Perry"),
  yt("fRh_vgS2dFE", "Justin Bieber - Sorry", "Justin Bieber"),
  yt("09R8_2nJtjg", "Maroon 5 - Sugar", "Maroon 5"),
  yt("hT_nvWreIhg", "OneRepublic - Counting Stars", "OneRepublic"),
  yt("YQHsXMglC9A", "Adele - Hello", "Adele"),
  yt("papuvlVeZg8", "Kesariya - Brahmastra", "Pritam"),
  yt("BddP6PYo2gs", "Arijit Singh - Tum Hi Ho", "Arijit Singh"),
  yt("SlPhMPnQ58k", "Shakira - Waka Waka", "Shakira"),
];

function filterFallback(query: string): AudioTrack[] {
  const q = query.trim().toLowerCase();
  if (!q) return FALLBACK_TRACKS;
  const hits = FALLBACK_TRACKS.filter((t) => `${t.title} ${t.artist}`.toLowerCase().includes(q));
  return hits.length ? hits : FALLBACK_TRACKS;
}

/**
 * Search YouTube music (category 10). Empty query loads trending music.
 * Never throws: falls back to cache, then to a curated list (quota/offline safe).
 */
export async function searchYouTubeMusic(
  query: string,
  signal?: AbortSignal,
): Promise<AudioTrack[]> {
  const cached = readCache(query);
  if (cached) return cached;
  if (!API_KEY) return filterFallback(query);

  const params = new URLSearchParams({
    key: API_KEY,
    part: "snippet",
    type: "video",
    videoCategoryId: "10",
    maxResults: "25",
    q: query.trim() || "trending music",
  });

  try {
    const res = await fetch(`${SEARCH_URL}?${params.toString()}`, { signal });
    if (!res.ok) return filterFallback(query);
    const json = (await res.json()) as { items?: YtItem[] };
    const tracks = (json.items ?? [])
      .filter((i) => i.id?.videoId)
      .map((i) => {
        const thumbs = i.snippet?.thumbnails ?? {};
        const cover =
          thumbs["medium"]?.url ?? thumbs["high"]?.url ?? thumbs["default"]?.url ?? undefined;
        return {
          id: `yt-${i.id!.videoId!}`,
          youtubeId: i.id!.videoId!,
          title: decode(i.snippet?.title ?? "Untitled"),
          artist: decode(i.snippet?.channelTitle ?? "YouTube"),
          cover,
        } satisfies AudioTrack;
      });
    if (!tracks.length) return filterFallback(query);
    writeCache(query, tracks);
    return tracks;
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw e;
    return filterFallback(query);
  }
}

/* ---------- Hidden background YouTube IFrame audio player ---------- */

interface YTPlayer {
  loadVideoById: (o: { videoId: string; startSeconds?: number } | string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (s: number, allow: boolean) => void;
  setVolume: (v: number) => void;
  unMute: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
}

let player: YTPlayer | null = null;
let ready: Promise<YTPlayer> | null = null;

function loadApi(): Promise<void> {
  const w = window as unknown as {
    YT?: { Player?: unknown };
    onYouTubeIframeAPIReady?: () => void;
  };
  if (w.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
}

function ensurePlayer(): Promise<YTPlayer> {
  if (player) return Promise.resolve(player);
  if (ready) return ready;
  ready = loadApi().then(
    () =>
      new Promise<YTPlayer>((resolve) => {
        let host = document.getElementById("yt-audio-host");
        if (!host) {
          host = document.createElement("div");
          host.id = "yt-audio-host";
          host.style.cssText =
            "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0;";
          document.body.appendChild(host);
        }
        const YT = (
          window as unknown as { YT: { Player: new (el: Element, o: unknown) => YTPlayer } }
        ).YT;
        const p = new YT.Player(host, {
          height: "1",
          width: "1",
          playerVars: { autoplay: 0, controls: 0, playsinline: 1, loop: 0, rel: 0 },
          events: {
            onReady: () => {
              player = p;
              try {
                p.unMute();
                p.setVolume(100);
              } catch {
                /* ignore */
              }
              resolve(p);
            },
          },
        });
      }),
  );
  return ready;
}

export function ytSetVolume(volume: number) {
  if (!player) return;
  try {
    const v = Math.min(100, Math.max(0, Math.round(volume * 100)));
    player.setVolume(v);
    if (v === 0) player.mute?.();
    else player.unMute?.();
  } catch {
    /* ignore */
  }
}

/** Start (or restart) a track. Plays full length — no auto timeout. */
export async function ytPlay(videoId: string, startSeconds = 0, volume = 1.0) {
  const p = await ensurePlayer();
  p.loadVideoById({ videoId, startSeconds });
  try {
    const v = Math.min(100, Math.max(0, Math.round(volume * 100)));
    p.setVolume(v);
    if (v === 0) p.mute?.();
    else p.unMute?.();
  } catch {
    /* ignore */
  }
  p.playVideo();
}

export async function ytResume() {
  if (!player) return;
  try {
    player.playVideo();
  } catch {
    /* ignore */
  }
}

export function ytPause() {
  try {
    player?.pauseVideo();
  } catch {
    /* ignore */
  }
}

export function ytSeek(seconds: number) {
  try {
    player?.seekTo(seconds, true);
  } catch {
    /* ignore */
  }
}

export function ytProgress(): { current: number; duration: number } {
  try {
    return { current: player?.getCurrentTime() ?? 0, duration: player?.getDuration() ?? 0 };
  } catch {
    return { current: 0, duration: 0 };
  }
}

export async function ytStop() {
  if (!player) return;
  try {
    player.stopVideo();
  } catch {
    /* ignore */
  }
}
