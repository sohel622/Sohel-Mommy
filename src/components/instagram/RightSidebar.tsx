import { useApp } from "@/lib/instagram/context";
import { suggestions } from "@/lib/instagram/data";

export function RightSidebar() {
  const { user, setView, showToast, t } = useApp();

  return (
    <aside className="hidden lg:block w-80 pl-2 py-2 flex-shrink-0">
      <div className="flex items-center justify-between mb-6 glass-card p-3 rounded-2xl">
        <button className="flex items-center space-x-3" onClick={() => setView("profile")}>
          <img
            src={user.avatar}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-500/50"
            alt="Profile"
          />
          <div className="text-left">
            <p className="font-semibold text-sm text-slate-100">{user.username}</p>
            <p className="text-xs text-slate-400">{user.fullName}</p>
          </div>
        </button>
        <button
          onClick={() => setView("profile")}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
        >
          Switch
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Suggested for you
        </span>
        <button className="text-xs font-semibold text-slate-300 hover:text-white transition">
          See All
        </button>
      </div>

      <div className="space-y-3 glass-card p-4 rounded-2xl">
        {suggestions.map((s) => (
          <div key={s.username} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={s.avatar} className="w-9 h-9 rounded-full object-cover" alt={s.username} />
              <div>
                <p className="text-sm font-semibold text-slate-100">{s.username}</p>
                <p className="text-[11px] text-slate-400">{s.relation}</p>
              </div>
            </div>
            <button
              onClick={() => showToast(`Following ${s.username}`)}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
            >
              {t("follow")}
            </button>
          </div>
        ))}
      </div>

      <footer className="mt-8 text-xs text-slate-500 space-y-4 px-1">
        <p className="leading-relaxed">
          About • Help • Press • API • Jobs • Privacy • Terms • Locations • Language
        </p>
        <p className="font-medium text-slate-600">© 2026 INSTAGRAM CLONE</p>
      </footer>
    </aside>
  );
}
