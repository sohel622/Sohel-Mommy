import { useState } from "react";
import {
  ArrowLeft,
  X,
  HelpCircle,
  ShieldAlert,
  Video,
  Gift,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Lock,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/lib/instagram/context";

export function HelpSupportView() {
  const { setView, user, showToast, t } = useApp();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const isGiftUnlocked = user.followers >= 50;

  const faqs = [
    {
      q: "What are the core community safety rules?",
      a: "All uploaded media is strictly monitored. Adult content (18+), harassment, hate speech, spam, and copyrighted video distribution are strictly prohibited and will result in immediate permanent account suspension.",
    },
    {
      q: "What is the daily video upload limit?",
      a: "To ensure high video quality and server stability, creators can upload up to 10 videos per day. Uploads reset automatically every 24 hours.",
    },
    {
      q: "How do I unlock the 'My Gift' monetization feature?",
      a: "Reach a milestone of 50 Followers on your profile. Once achieved, 'My Gift' virtual tipping and monetization badge will unlock automatically on your Reels.",
    },
    {
      q: "What is the recommended video resolution and aspect ratio?",
      a: "We recommend vertical 9:16 aspect ratio videos (1080 x 1920 pixels) in MP4 format under 60 seconds for peak engagement and instant buffering.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("profile")}
            className="p-2 rounded-full bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 transition border border-slate-800"
            aria-label="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              {t("help_and_support")}
            </h1>
            <p className="text-xs text-slate-400">{t("guidelines")}</p>
          </div>
        </div>

        <button
          onClick={() => setView("profile")}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-40 h-40 text-blue-400" />
          </div>
          <div className="relative z-10 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 uppercase tracking-wider inline-flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> {t("safety_standards")}
            </span>
            <h2 className="text-xl font-extrabold text-white">{t("help_center_policies")}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review platform guidelines, adult content restrictions, video format standards, and
              unlock requirements for creator monetization features.
            </p>
          </div>
        </div>

        {/* 1. Content Guidelines Card */}
        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {t("content_guidelines")}
                <span className="text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                  Strict 18+ Policy
                </span>
              </h3>
              <p className="text-xs text-slate-400">Community safety and moderation standards</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">{t("strict_adult_restrictions")}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Explicit adult material, sexually explicit imagery, violence, hate speech, and
                  harassment are strictly prohibited.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">{t("copyright_originality")}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ensure you hold ownership or broadcast rights for all uploaded video clips and
                  music audio tracks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Upload Guidelines Card */}
        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{t("upload_guidelines")}</h3>
              <p className="text-xs text-slate-400">
                Daily limits and technical video specifications
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" /> {t("daily_video_limit")}
                </span>
                <span className="text-amber-400 font-mono text-xs">10 / Day</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Creators can post up to 10 videos per 24 hours to prevent spam and maintain high
                bandwidth quality.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-bold">
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-purple-400" /> {t("aspect_ratio")}
                </span>
                <span className="text-purple-300 font-mono text-xs">9:16 Vertical</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recommended 1080x1920 vertical video standards under 60 seconds for immersive
                full-screen display.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Feature Eligibility Card */}
        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{t("feature_eligibility")}</h3>
              <p className="text-xs text-slate-400">Unlock creator perks and virtual gifting</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/40 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-sm text-slate-100">
                  {t("my_gift_feature")}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isGiftUnlocked
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {isGiftUnlocked ? "Unlocked 🎉" : `${user.followers} / 50 Followers`}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Reach <strong className="text-amber-400 font-bold">50 Followers</strong> on your
              profile to automatically unlock the 'My Gift' tipping feature and receive virtual
              gifts on your Feels.
            </p>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (user.followers / 50) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                {isGiftUnlocked
                  ? "Milestone achieved!"
                  : `${50 - user.followers} more follower${50 - user.followers === 1 ? "" : "s"} needed`}
              </p>
            </div>
          </div>
        </section>

        {/* 4. Frequently Asked Questions Accordion */}
        <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <h3 className="text-base font-bold text-slate-100">{t("faqs")}</h3>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-950/70 border border-slate-800/80 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-200 hover:text-white transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      expandedFaq === idx ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support Button */}
        <div className="pt-2 text-center">
          <button
            onClick={() => showToast("Support team notified! We will contact you shortly.")}
            className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm rounded-full transition border border-slate-700 shadow-lg inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" /> {t("contact_support")}
          </button>
        </div>
      </main>
    </div>
  );
}
