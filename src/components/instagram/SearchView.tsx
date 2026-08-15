import { useMemo, useState } from "react";
import { Search, XCircle } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { suggestions } from "@/lib/instagram/data";
import searchEmptyArt from "@/assets/search-empty.png";

export function SearchView() {
  const { chats, posts, showToast, openUserProfile, t } = useApp();
  const [query, setQuery] = useState("");

  const allUsers = useMemo(() => {
    const set = new Map<string, string>();
    chats.forEach((c) => set.set(c.username, c.avatar));
    posts.forEach((p) => set.set(p.username, p.userAvatar));
    suggestions.forEach((s) => set.set(s.username, s.avatar));
    return Array.from(set.entries()).map(([username, avatar]) => ({ username, avatar }));
  }, [chats, posts]);

  const results = query
    ? allUsers.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <section className="w-full max-w-[935px] px-3 sm:px-4 py-2 space-y-4 min-h-screen mx-auto">
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md pb-3 pt-1 border-b border-slate-800/80">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_input_placeholder")}
            className="w-full pl-11 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-full text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 text-slate-400 hover:text-slate-100 transition p-1"
              aria-label="Clear"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {query ? (
        <div className="space-y-2.5">
          {results.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-10">No results for "{query}"</p>
          ) : (
            results.map((u) => (
              <button
                key={u.username}
                onClick={() => openUserProfile(u.username)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 transition"
              >
                <img
                  src={u.avatar}
                  className="w-11 h-11 rounded-full object-cover"
                  alt={u.username}
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-100">{u.username}</p>
                  <p className="text-xs text-slate-400">Instagram user</p>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div
          id="search-empty-state"
          className="flex flex-col items-center justify-center py-14 text-center space-y-3"
        >
          <img
            src={searchEmptyArt}
            alt="No content found"
            loading="lazy"
            width={816}
            height={816}
            className="w-52 h-52 object-contain select-none"
            draggable={false}
          />
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-slate-400">{t("no_content")}</h4>
            <p className="text-xs text-slate-500 max-w-xs">{t("search_placeholder")}</p>
          </div>
        </div>
      )}
    </section>
  );
}
