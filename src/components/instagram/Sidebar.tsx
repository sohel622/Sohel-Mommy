import {
  Home,
  Search,
  Compass,
  Film,
  Send,
  Heart,
  PlusSquare,
  Menu,
  BarChart2,
} from "lucide-react";
import { useApp, type ViewName } from "@/lib/instagram/context";

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 transition ${
        active ? "text-slate-100 font-semibold" : "text-slate-400 hover:text-slate-100"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="hidden xl:inline text-base">{label}</span>
    </button>
  );
}

export function Sidebar() {
  const { view, setView, user, setSettingsOpen, setUploadDraft, showToast, openInsights, t } =
    useApp();

  const go = (v: ViewName) => () => setView(v);

  const triggerUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      setUploadDraft({ file, previewUrl, mediaType });
    };
    input.click();
  };

  return (
    <aside className="hidden md:flex flex-col justify-between w-20 xl:w-64 border-r border-slate-800 bg-slate-900/90 backdrop-blur-xl h-screen sticky top-0 p-4 z-40">
      <div className="space-y-6">
        <div className="px-3 pt-3">
          <h1
            onClick={go("feed")}
            className="font-logo text-4xl hidden xl:block cursor-pointer ig-gradient-text hover:opacity-90 transition"
          >
            Instagram
          </h1>
          <button
            onClick={go("feed")}
            className="xl:hidden text-3xl text-pink-500 hover:scale-110 transition"
            aria-label="Home"
          >
            ◉
          </button>
        </div>

        <nav className="space-y-2">
          <NavItem
            active={view === "feed"}
            icon={<Home />}
            label={t("home")}
            onClick={go("feed")}
          />
          <NavItem
            active={view === "search"}
            icon={<Search />}
            label={t("search")}
            onClick={go("search")}
          />
          <NavItem icon={<Compass />} label={t("search")} onClick={go("search")} />
          <NavItem
            active={view === "reels"}
            icon={<Film />}
            label={t("reels")}
            onClick={go("reels")}
          />
          <NavItem
            icon={<BarChart2 className="text-pink-400" />}
            label={t("insights")}
            onClick={() => openInsights()}
          />
          <NavItem
            active={view === "chats"}
            icon={<Send />}
            label={t("messages")}
            onClick={go("chats")}
          />
          <NavItem
            icon={<Heart />}
            label={t("notifications")}
            onClick={() => showToast(t("no_notifications"))}
          />
          <NavItem icon={<PlusSquare />} label={t("create")} onClick={triggerUpload} />
          <button
            onClick={go("profile")}
            className={`flex items-center space-x-4 w-full p-3.5 rounded-xl hover:bg-slate-800/80 transition ${
              view === "profile"
                ? "text-slate-100 font-semibold"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <img
              src={user.avatar}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-700"
              alt="Avatar"
            />
            <span className="hidden xl:inline text-base">{t("profile")}</span>
          </button>
        </nav>
      </div>

      <NavItem icon={<Menu />} label={t("settings")} onClick={() => setSettingsOpen(true)} />
    </aside>
  );
}
