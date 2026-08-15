import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { DEFAULT_AVATAR } from "@/lib/instagram/data";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

const STORY_DURATION = 5000;

export function StoryViewer() {
  const { storyViewer, closeStoryViewer, stories, openUserProfile } = useApp();
  useBodyScrollLock(storyViewer.open);
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(storyViewer.index);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (storyViewer.open) setIndex(storyViewer.index);
  }, [storyViewer.open, storyViewer.index]);

  useEffect(() => {
    if (!storyViewer.open) return;
    setProgress(0);
    startRef.current = performance.now();
    const tick = (t: number) => {
      const pct = Math.min(100, ((t - startRef.current) / STORY_DURATION) * 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (index < stories.length - 1) {
          setIndex((i) => i + 1);
        } else {
          closeStoryViewer();
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [storyViewer.open, index, stories.length, closeStoryViewer]);

  if (!storyViewer.open) return null;
  const story = stories[index];
  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[80] flex items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-sm h-full md:h-[650px] bg-black md:rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 p-4 z-20 space-y-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-amber-500 h-full transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => {
                closeStoryViewer();
                openUserProfile(story.username);
              }}
              className="flex items-center gap-3"
            >
              <img
                src={story.avatar || DEFAULT_AVATAR}
                className="w-8 h-8 rounded-full border border-white/50 object-cover"
                alt={story.username}
              />
              <span className="font-semibold text-sm">{story.username}</span>
            </button>
            <button
              onClick={closeStoryViewer}
              className="text-white/90 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {story.mediaType === "image" ? (
          story.mediaUrl ? (
            <img src={story.mediaUrl} alt="" className="w-full h-full object-cover" />
          ) : null
        ) : story.mediaUrl ? (
          <video
            src={story.mediaUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              e.preventDefault();
            }}
            className="w-full h-full object-cover transform-gpu translate-z-0 will-change-transform"
            style={{ transform: "translateZ(0)" }}
          />
        ) : null}

        {/* Tap zones */}
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="absolute left-0 top-0 bottom-0 w-1/3"
          aria-label="Previous"
        />
        <button
          onClick={() => (index < stories.length - 1 ? setIndex((i) => i + 1) : closeStoryViewer())}
          className="absolute right-0 top-0 bottom-0 w-1/3"
          aria-label="Next"
        />
      </div>
    </div>
  );
}
