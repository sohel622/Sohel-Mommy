import { useApp } from "@/lib/instagram/context";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[90] px-4 py-2.5 bg-slate-900/95 border border-slate-700 text-slate-100 text-sm rounded-full shadow-2xl animate-fade-in backdrop-blur-md">
      {toast}
    </div>
  );
}
