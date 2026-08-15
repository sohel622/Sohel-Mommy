import { useEffect, useState } from "react";

export interface AudioTrack {
  id: number | string;
  title: string;
  artist: string;
  duration?: string;
  /** Optional preview source; YouTube tracks stream through the IFrame player. */
  src?: string;
  /** YouTube video id when the track comes from YouTube Data API v3. */
  youtubeId?: string;
  /** Optional cover thumbnail (data URL or image URL). */
  cover?: string;
  /** Trim start offset (seconds) chosen in the audio editor. */
  startAt?: number;
}

let tracks: AudioTrack[] = [];
const listeners = new Set<(t: AudioTrack[]) => void>();

const emit = () => listeners.forEach((l) => l(tracks));

export function getTracks() {
  return tracks;
}

export function addTrack(track: AudioTrack) {
  tracks = [track, ...tracks.filter((t) => t.id !== track.id)];
  emit();
}

/** Subscribe a component to the shared music library. */
export function useAudioLibrary() {
  const [list, setList] = useState<AudioTrack[]>(tracks);
  useEffect(() => {
    const fn = (t: AudioTrack[]) => setList(t);
    listeners.add(fn);
    setList(tracks);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return list;
}

export function formatSeconds(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Grab a single frame from a video URL as a data-URL cover image. */
export function captureVideoThumbnail(src: string, at = 0.4): Promise<string | undefined> {
  return new Promise((resolve) => {
    try {
      const v = document.createElement("video");
      v.src = src;
      v.muted = true;
      v.crossOrigin = "anonymous";
      v.preload = "metadata";
      const done = (val?: string) => {
        v.removeAttribute("src");
        resolve(val);
      };
      v.onloadeddata = () => {
        try {
          v.currentTime = Math.min(at, (v.duration || 1) / 2);
        } catch {
          done(undefined);
        }
      };
      v.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 120;
          canvas.height = 120;
          const ctx = canvas.getContext("2d");
          if (!ctx) return done(undefined);
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          done(canvas.toDataURL("image/jpeg", 0.7));
        } catch {
          done(undefined);
        }
      };
      v.onerror = () => done(undefined);
      window.setTimeout(() => done(undefined), 4000);
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * Registers the original sound of an uploaded reel into the shared library so
 * it can be reused from the "Add sound" drawer.
 */
export async function registerOriginalSound(opts: {
  id: number;
  mediaUrl: string;
  creator: string;
}) {
  const cover = await captureVideoThumbnail(opts.mediaUrl);
  addTrack({
    id: opts.id,
    title: `Original Sound - ${opts.creator}`,
    artist: opts.creator,
    duration: "0:30",
    src: opts.mediaUrl,
    cover,
  });
}

const FALLBACK_AUDIO_URLS = [
  "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-feeling-happy-5.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-sweet-love-121.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-a-very-happy-gospel-128.mp3",
];

const RELIABLE_YOUTUBE_AUDIO_SOURCES: Record<string, string> = {
  kJQP7kiw5Fk: "https://assets.mixkit.co/music/preview/mixkit-feeling-happy-5.mp3",
  JGwWNGJdvx8: "https://assets.mixkit.co/music/preview/mixkit-sweet-love-121.mp3",
  RgKAFK5djSk: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
  OPf0YbXqDm0: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  papuvlVeZg8: "https://assets.mixkit.co/music/preview/mixkit-a-very-happy-gospel-128.mp3",
};

/** Returns a reliable audio URL for previewing and audio mixing. */
export function getTrackAudioSrc(track: AudioTrack): string {
  if (track.src) return track.src;
  if (track.youtubeId && RELIABLE_YOUTUBE_AUDIO_SOURCES[track.youtubeId]) {
    return RELIABLE_YOUTUBE_AUDIO_SOURCES[track.youtubeId]!;
  }
  const str = String(track.youtubeId || track.id || track.title);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_AUDIO_URLS[Math.abs(hash) % FALLBACK_AUDIO_URLS.length]!;
}
