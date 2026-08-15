import { useMemo } from "react";
import {
  Home,
  Search,
  Compass,
  Film,
  Send,
  Heart,
  PlusSquare,
  BarChart2,
  Settings,
  Bookmark,
  HelpCircle,
  LogOut,
  X,
  User,
  Users,
  Moon,
  Sun,
  Globe,
  UserX,
} from "lucide-react";
import { useApp, type ViewName } from "@/lib/instagram/context";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

export function Drawer({ open, onClose }: DrawerProps) {
  const {
    view,
    setView,
    user,
    setSettingsOpen,
    setUploadDraft,
    openInsights,
    setDeleteAccountModalOpen,
    theme,
    toggleTheme,
    language,
    logout,
    showToast,
    t,
  } = useApp();

  useBodyScrollLock(open);

  const navItems = useMemo(
    () => [
      { id: "feed", label: t("home"), icon: Home, view: "feed" as ViewName },
      { id: "feels", label: t("feels") || "Feels", icon: Film, view: "reels" as ViewName },
      {
        id: "friends",
        label: t("friends") || "Friends",
        icon: Users,
        action: () => {
          onClose();
          showToast(t("friends") || "Friends list");
        },
      },
      { id: "search", label: t("search"), icon: Search, view: "search" as ViewName },
      { id: "explore", label: t("explore"), icon: Compass, view: "search" as ViewName },
      { id: "messages", label: t("messages"), icon: Send, view: "chats" as ViewName },
      { id: "profile", label: t("profile"), icon: User, view: "profile" as ViewName },
      {
        id: "saved_posts",
        label: t("saved_posts") || t("saved") || "Saved Posts",
        icon: Bookmark,
        view: "saved-posts" as ViewName,
      },
    ],
    [t, onClose, showToast],
  );

  if (!open) return null;

  const triggerUpload = () => {
    onClose();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadDraft({
        file,
        previewUrl: URL.createObjectURL(file),
        mediaType: file.type.startsWith("video") ? "video" : "image",
      });
    };
    input.click();
  };

  const handleNavigate = (targetView: ViewName) => {
    setView(targetView);
    onClose();
  };

  return (
    <>
      {/* Dimmed & Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 touch-none overscroll-none animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Side Navigation Drawer */}
      <aside
        data-modal-scrollable="true"
        className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-[#121214] text-white z-50 overflow-y-auto shadow-2xl border-r border-white/10 flex flex-col justify-between p-5 animate-in slide-in-from-left duration-250 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/50"
              />
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-100 truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-slate-400 truncate">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = "view" in item && item.view ? view === item.view : false;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if ("action" in item && typeof item.action === "function") {
                      item.action();
                    } else if ("view" in item && item.view) {
                      handleNavigate(item.view);
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition text-sm font-medium ${
                    active
                      ? "bg-pink-600/20 text-pink-400 font-semibold border border-pink-500/20"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-pink-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Create Media */}
            <button
              onClick={triggerUpload}
              className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white"
            >
              <PlusSquare className="w-5 h-5 text-emerald-400" />
              <span>{t("create")}</span>
            </button>

            {/* Creator Insights */}
            <button
              onClick={() => {
                onClose();
                openInsights();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white"
            >
              <BarChart2 className="w-5 h-5 text-pink-400" />
              <span>{t("insights")}</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => {
                onClose();
                showToast(t("no_notifications"));
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              <span>{t("notifications")}</span>
            </button>

            {/* Help & Support */}
            <button
              onClick={() => handleNavigate("help-support")}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition text-sm font-medium ${
                view === "help-support"
                  ? "bg-pink-600/20 text-pink-400 font-semibold"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <span>{t("help_center")}</span>
            </button>
          </nav>
        </div>

        {/* Footer Quick Controls */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 transition text-sm text-slate-300"
          >
            <span className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-purple-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span>{t("theme")}</span>
            </span>
            <span className="text-xs text-slate-400 capitalize">
              {theme === "dark" ? t("dark_mode") : t("light_mode")}
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => {
              onClose();
              setSettingsOpen(true);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800/60 transition text-sm text-slate-300"
          >
            <span className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>{t("settings")}</span>
            </span>
            <span className="text-xs text-pink-400 flex items-center gap-1">
              <Globe className="w-3 h-3" /> {language}
            </span>
          </button>

          {/* Delete Account */}
          <button
            onClick={() => {
              onClose();
              setDeleteAccountModalOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-400/90 hover:bg-rose-500/10 transition text-sm font-medium"
          >
            <UserX className="w-4 h-4 text-rose-400" />
            <span>{t("delete_account")}</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
