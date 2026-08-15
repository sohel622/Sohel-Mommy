import { useState, useMemo } from "react";
import { ChevronDown, Search, X, Check, Heart, Star, MessageCircle, Sparkles } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { LANGUAGES } from "@/lib/instagram/translations";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

export function WelcomeView() {
  const { language, setLanguage, setShowLogin, t } = useApp();
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useBodyScrollLock(langSheetOpen);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGES;
    const q = searchQuery.toLowerCase();
    return LANGUAGES.filter((l) => l.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleSelectLang = (lang: string) => {
    setLanguage(lang);
    setLangSheetOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-between items-center bg-white dark:bg-black text-slate-900 dark:text-slate-100 overflow-y-auto touch-pan-y select-none px-6 py-8 md:py-12">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-tr from-pink-500/15 via-rose-500/10 to-amber-500/15 blur-3xl rounded-full pointer-events-none" />

      {/* 1. Top Language Selector Button */}
      <header className="w-full flex justify-center z-10">
        <button
          onClick={() => setLangSheetOpen(true)}
          className="px-4 py-2 rounded-full bg-slate-100/90 dark:bg-neutral-900/90 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-800 dark:text-slate-200 text-xs md:text-sm font-semibold flex items-center gap-1.5 transition border border-slate-200/80 dark:border-neutral-800 shadow-sm backdrop-blur-md"
        >
          <span>{language}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </header>

      {/* 2. Center Content Container */}
      <main className="flex-1 w-full max-w-sm mx-auto flex flex-col items-center justify-center my-6 z-10">
        {/* Stacked Photo Collage Graphic with Floating Reaction Badges */}
        <div className="relative w-64 h-72 md:w-72 md:h-80 flex items-center justify-center mb-8">
          {/* Tilted Card 1 (Left Back) */}
          <div className="absolute top-2 -left-1 w-44 h-56 md:w-48 md:h-60 rounded-3xl overflow-hidden shadow-xl border-2 border-white/80 dark:border-neutral-800 rotate-[-10deg] transition transform hover:rotate-[-6deg] duration-300">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
              alt="Creator portrait"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          {/* Tilted Card 2 (Right Back) */}
          <div className="absolute top-4 -right-1 w-44 h-56 md:w-48 md:h-60 rounded-3xl overflow-hidden shadow-xl border-2 border-white/80 dark:border-neutral-800 rotate-[12deg] transition transform hover:rotate-[8deg] duration-300">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80"
              alt="Lifestyle photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          {/* Center Card (Front) */}
          <div className="relative z-10 w-48 h-64 md:w-52 md:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-900 bg-neutral-900 transform hover:scale-[1.02] transition duration-300">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
              alt="Featured reel"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            {/* User Avatar Badge in Card */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-[10px] font-bold text-white tracking-wide">@tamanna</span>
            </div>
          </div>

          {/* Floating Reaction Badge 1: Heart Likes (Top Right) */}
          <div className="absolute -top-1 -right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-lg border border-pink-500/30 text-xs font-bold text-slate-800 dark:text-slate-100 animate-bounce duration-[2500ms]">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>18.4K</span>
          </div>

          {/* Floating Reaction Badge 2: Star Badge (Top Left) */}
          <div className="absolute top-12 -left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white font-bold text-[11px] shadow-lg shadow-amber-500/25">
            <Star className="w-3.5 h-3.5 fill-white text-white" />
            <span>{t("trending")}</span>
          </div>

          {/* Floating Reaction Badge 3: Emoji Popups (Bottom Left) */}
          <div className="absolute -bottom-2 -left-2 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-xl border border-slate-200 dark:border-neutral-800 text-sm">
            <span>😍</span>
            <span>🔥</span>
            <span>✨</span>
          </div>

          {/* Floating Reaction Badge 4: Comment count (Bottom Right) */}
          <div className="absolute bottom-6 -right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-neutral-800 text-xs font-bold text-slate-800 dark:text-slate-100">
            <MessageCircle className="w-3.5 h-3.5 text-pink-500" />
            <span>3.2k</span>
          </div>

          {/* Sparkles Decoration */}
          <Sparkles className="absolute -top-4 left-6 z-20 w-5 h-5 text-amber-400 animate-pulse" />
        </div>

        {/* Headings & Tagline */}
        <div className="text-center space-y-2 mt-2 px-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("join_us")}
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-neutral-300 max-w-xs leading-relaxed">
            {t("tagline")}
          </p>
        </div>
      </main>

      {/* 3. Bottom Action Section - Prominent Pink Gradient Pill Button */}
      <footer className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 z-10 pb-4">
        <button
          onClick={() => setShowLogin(true)}
          className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#FF007F] via-[#EC4899] to-[#FF5500] hover:opacity-95 text-white font-bold text-base shadow-xl shadow-pink-500/30 transition transform active:scale-[0.98] flex items-center justify-center gap-2 tracking-wide cursor-pointer"
        >
          <span>{t("get_started")}</span>
        </button>
      </footer>

      {/* 4. Language Selector Scrollable Bottom Sheet Modal */}
      {langSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
          onClick={() => setLangSheetOpen(false)}
        >
          {/* Bottom Sheet Container */}
          <div
            data-modal-scrollable="true"
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-[#18181b] border-t border-white/10 rounded-t-[28px] flex flex-col max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-250 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
          >
            {/* Sheet Handlebar */}
            <div className="pt-2.5 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Modal Header */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-base font-bold text-white">{t("select_language")}</h3>
              <button
                onClick={() => setLangSheetOpen(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_language")}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-pink-500/50 transition"
                />
              </div>
            </div>

            {/* Scrollable Language Options List with Radio/Checkbox Indicators */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 no-scrollbar pb-4">
              {filteredLanguages.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">{t("no_results")}</div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = language === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => handleSelectLang(lang)}
                      className={`w-full px-6 py-3.5 flex items-center justify-between transition text-sm font-medium text-left ${
                        isSelected
                          ? "bg-pink-950/30 text-pink-400 font-bold"
                          : "hover:bg-slate-800/50 text-slate-200"
                      }`}
                    >
                      <span>{lang}</span>

                      {/* Radio / Check Indicator */}
                      <div className="flex items-center justify-center">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-pink-500/30">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
