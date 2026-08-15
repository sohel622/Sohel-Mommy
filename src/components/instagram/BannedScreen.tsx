import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useApp } from "@/lib/instagram/context";

export function BannedScreen() {
  const { banned, setBanned } = useApp();
  if (!banned) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-6 text-center text-white select-none">
      <div className="max-w-md w-full glass-card border border-rose-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-rose-500 tracking-tight">Account Suspended</h2>
          <p className="text-xs text-rose-400 font-semibold uppercase tracking-widest">
            Policy Violation Detected
          </p>
        </div>
        <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-900/50 text-left text-sm text-slate-300 leading-relaxed space-y-2">
          <p className="font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Community Safety Engine
          </p>
          <p>
            Your account has been permanently suspended for violating community safety guidelines
            (18+ content restriction).
          </p>
        </div>
        <button
          onClick={() => setBanned(false)}
          className="text-xs text-slate-400 hover:text-slate-200 underline"
        >
          Restore (demo)
        </button>
      </div>
    </div>
  );
}
