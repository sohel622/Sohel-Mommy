import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/lib/instagram/context";

export function CopyrightReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useApp();
  const [text, setText] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-5 fixed bottom-0 left-0 right-0 z-[1000] animate-slide-up"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Copyright Claim</h3>
          <button onClick={onClose} aria-label="Close copyright claim">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Type your copyright claim or report details here..."
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
        />
        <button
          onClick={() => {
            setText("");
            showToast("Copyright report submitted successfully!");
            onClose();
          }}
          className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Send Report
        </button>
      </div>
    </div>
  );
}
