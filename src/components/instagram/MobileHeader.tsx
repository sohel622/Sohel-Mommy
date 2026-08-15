import { Plus } from "lucide-react";
import { useApp } from "@/lib/instagram/context";

export function MobileHeader() {
  const { setView, setCreatePostModalOpen } = useApp();

  return (
    <header
      id="global-header"
      className="md:hidden flex items-center justify-between px-4 h-12 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out will-change-transform"
    >
      {/* App Title on the left */}
      <h1
        onClick={() => setView("feed")}
        className="font-logo text-2xl leading-none text-slate-100 cursor-pointer select-none"
      >
        Tweetgram
      </h1>

      {/* Post Creation Plus icon on the top-right */}
      <button
        onClick={() => setCreatePostModalOpen(true)}
        className="p-1.5 text-slate-200 hover:text-pink-500 transition rounded-full active:scale-95 flex items-center justify-center"
        aria-label="Create Post"
      >
        <Plus className="w-6 h-6" />
      </button>
    </header>
  );
}
