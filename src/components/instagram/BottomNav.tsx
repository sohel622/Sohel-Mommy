import { Home, Search, MessageSquareText, SquarePlay } from "lucide-react";
import { useApp, type ViewName } from "@/lib/instagram/context";

export function BottomNav() {
  const { view, setView, user, t } = useApp();
  const onReels = view === "reels";
  if (onReels) return null;

  const tabs: { id: ViewName; icon: React.ReactNode; label: string }[] = [
    { id: "feed", icon: <Home className="w-5 h-5" />, label: t("home") },
    { id: "search", icon: <Search className="w-5 h-5" />, label: t("search") },
    { id: "chats", icon: <MessageSquareText className="w-5 h-5" />, label: t("messages") },
    { id: "reels", icon: <SquarePlay className="w-5 h-5" />, label: t("reels") },
  ];

  return (
    <nav
      id="bottom-nav"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-12 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-in-out will-change-transform ${
        onReels ? "bg-black" : "bg-white dark:bg-black"
      }`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          className={`flex-1 flex items-center justify-center py-1 transition ${
            onReels
              ? "text-white opacity-100"
              : view === tab.id
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400"
          }`}
          aria-label={tab.label}
        >
          {tab.icon}
        </button>
      ))}
      <button
        onClick={() => setView("profile")}
        className="flex-1 flex items-center justify-center py-1"
        aria-label={t("profile")}
      >
        <img
          src={user.avatar}
          className={`w-6 h-6 rounded-full object-cover ${
            view === "profile" ? "ring-2 ring-pink-500" : "ring-1 ring-slate-400/50"
          }`}
          alt="Profile"
        />
      </button>
    </nav>
  );
}
