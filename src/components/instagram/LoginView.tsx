import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/instagram/context";

/** Tweetgram login screen — Google + Email only. */
export function LoginView() {
  const { login, showToast, setShowLogin, t } = useApp();
  const [agreed, setAgreed] = useState(false);

  const attempt = (method: "google" | "email") => {
    if (!agreed) {
      showToast(t("please_accept_terms"));
      return;
    }
    login(method);
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-white dark:bg-black text-slate-900 dark:text-slate-100 overflow-y-auto touch-pan-y">
      {/* Top Header Back Button to WelcomeView */}
      <div className="p-4 flex items-center">
        <button
          onClick={() => setShowLogin(false)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition"
          aria-label="Back to welcome page"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-7 gap-8 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF0055] via-[#FF007F] to-amber-400 flex items-center justify-center shadow-2xl shadow-pink-500/30">
            <span className="text-3xl font-extrabold text-black">TG</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("log_in")}</h1>
          <p className="text-sm text-center opacity-60 max-w-xs">{t("tagline")}</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => attempt("google")}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-slate-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-neutral-900 transition"
          >
            <GoogleMark />
            {t("continue_with_google")}
          </button>
          <button
            onClick={() => attempt("email")}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF007F] text-white font-bold text-sm shadow-lg shadow-pink-500/25"
          >
            <Mail className="w-4 h-4" />
            {t("continue_with_email")}
          </button>
        </div>
      </div>

      <div className="px-7 pb-10 max-w-sm w-full mx-auto">
        <label className="flex items-start gap-3 text-xs leading-relaxed opacity-80 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-pink-500 rounded cursor-pointer"
          />
          <span className="select-none">{t("agree_terms")}</span>
        </label>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
