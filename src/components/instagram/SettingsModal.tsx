import { useState, useMemo } from "react";
import {
  LogOut,
  UserX,
  Settings,
  ChevronRight,
  X,
  Sun,
  Moon,
  Globe,
  Check,
  Search,
  ArrowLeft,
  User,
  Shield,
  Bookmark,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { LANGUAGES } from "@/lib/instagram/translations";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";
import { DEFAULT_AVATAR } from "@/lib/instagram/data";

export function SettingsModal() {
  const {
    user,
    settingsOpen,
    setSettingsOpen,
    setDeleteAccountModalOpen,
    setView,
    showToast,
    theme,
    toggleTheme,
    logout,
    language,
    setLanguage,
    t,
  } = useApp();

  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useBodyScrollLock(settingsOpen || langSheetOpen);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGES;
    const q = searchQuery.toLowerCase();
    return LANGUAGES.filter((l) => l.toLowerCase().includes(q));
  }, [searchQuery]);

  if (!settingsOpen) return null;

  return (
    <>
      <div
        data-modal-scrollable="true"
        className="fixed inset-0 z-50 bg-[#0a0a0c] text-white overflow-y-auto overscroll-y-contain animate-in fade-in duration-200"
      >
        {/* Sticky Header with Back Button */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-slate-800/80">
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 -ml-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800/60 transition active:scale-95 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight text-center flex-1 pr-7">
            {t("settings")}
          </h1>
        </header>

        {/* Content Container */}
        <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
          {/* User Profile Mini Header Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt={user.fullName || user.username}
              className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-slate-100 truncate">
                {user.fullName || user.username}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                @{user.username.toLowerCase().replace(/\s+/g, "_")}
              </p>
            </div>
            <button
              onClick={() => {
                setSettingsOpen(false);
                setView("account");
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-pink-600/20 text-pink-400 border border-pink-500/30 hover:bg-pink-600/30 transition"
            >
              {t("edit_profile")}
            </button>
          </div>

          {/* Account Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {t("account")}
            </h2>
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-sm">
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setView("account");
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block text-slate-100">
                      {t("edit_profile")}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Name, bio, username & contact
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() =>
                  showToast("Password & security are synced with your Supabase account")
                }
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block text-slate-100">
                      Change Password / Security
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Two-factor authentication & password
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setView("saved-posts");
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block text-slate-100">
                      {t("saved_posts")}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Saved collections and bookmarks
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Preferences
            </h2>
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-sm">
              <button
                onClick={() => setLangSheetOpen(true)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block text-slate-100">
                      {t("language")}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Interface and content language
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {language}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block text-slate-100">{t("theme")}</span>
                    <span className="text-xs text-slate-400 block">
                      Toggle dark & light appearance
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 capitalize px-2.5 py-1 rounded-full bg-slate-800/60">
                  {theme === "dark" ? t("dark_mode") : t("light_mode")}
                </span>
              </button>
            </div>
          </div>

          {/* Support & Info Section */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {t("help_support")}
            </h2>
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-sm">
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setView("help-support");
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block text-slate-100">
                      {t("help_support")}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Creator policies, guidelines & FAQs
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => showToast("Tweetgram Terms & Privacy Policy")}
                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition text-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block text-slate-100">
                      {t("terms")} & {t("privacy_policy")}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Community standards & terms
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400/80 px-1">
              Danger Zone
            </h2>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  logout();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-2xl transition shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4" />
                <span>{t("logout")}</span>
              </button>

              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setDeleteAccountModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 font-bold transition flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <UserX className="w-4 h-4 text-rose-400" />
                <span>{t("delete_account")}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Language Picker Bottom Sheet from Settings */}
      {langSheetOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-md touch-none overscroll-none animate-in fade-in duration-200"
          onClick={() => setLangSheetOpen(false)}
        >
          <div
            data-modal-scrollable="true"
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 z-[60] max-w-lg mx-auto bg-[#18181b] border-t border-white/10 rounded-t-[28px] max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
          >
            <div className="pt-2.5 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

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

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 no-scrollbar pb-4">
              {filteredLanguages.map((lang) => {
                const isSelected = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangSheetOpen(false);
                    }}
                    className={`w-full px-6 py-3.5 flex items-center justify-between transition text-sm ${
                      isSelected
                        ? "bg-pink-950/30 text-pink-400 font-bold"
                        : "hover:bg-slate-800/50 text-slate-200"
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && <Check className="w-4 h-4 text-pink-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
