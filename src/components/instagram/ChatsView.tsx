import { ChevronDown, Edit3 } from "lucide-react";
import { useApp } from "@/lib/instagram/context";

export function ChatsView() {
  const { chats, showToast, openUserProfile } = useApp();

  return (
    <section
      id="view-chats"
      className="w-full max-w-[630px] mx-auto rounded-none md:rounded-2xl overflow-hidden min-h-[550px] bg-white dark:bg-black text-slate-900 dark:text-slate-100"
    >
      <div className="p-4 flex justify-between items-center bg-white dark:bg-black">
        <h2 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <span>alex_developer</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </h2>
        <button
          onClick={() => showToast("New Direct Message")}
          className="text-slate-300 hover:text-white transition"
          aria-label="New message"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </div>
      <div className="p-2 space-y-1">
        {chats.map((c) => (
          <button
            key={c.id}
            onClick={() => openUserProfile(c.username)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 transition"
          >
            <div className="relative flex-shrink-0">
              <img
                src={c.avatar}
                className="w-14 h-14 rounded-full object-cover"
                alt={c.username}
              />
              {c.unread && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-pink-500 border-2 border-slate-900" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-slate-100 truncate">{c.username}</p>
              <p
                className={`text-xs truncate ${
                  c.unread ? "text-slate-100 font-semibold" : "text-slate-400"
                }`}
              >
                {c.lastMsg}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
