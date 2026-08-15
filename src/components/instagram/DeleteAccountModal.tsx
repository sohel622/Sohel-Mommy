import React, { useState } from "react";
import { UserX, X, AlertTriangle, CheckCircle2, Phone } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { useBodyScrollLock } from "@/lib/instagram/useBodyScrollLock";
import { COUNTRIES } from "./countries";

export function DeleteAccountModal() {
  const { deleteAccountModalOpen, setDeleteAccountModalOpen, showToast, t } = useApp();
  useBodyScrollLock(deleteAccountModalOpen);
  const [dial, setDial] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!deleteAccountModalOpen) return null;

  const handleClose = () => {
    setDeleteAccountModalOpen(false);
    // Reset state after transition
    setTimeout(() => {
      setSubmitted(false);
      setPhoneNumber("");
      setReason("");
      setAdditionalInfo("");
      setErrorMsg("");
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.trim().length < 5) {
      setErrorMsg(t("name_phone_required"));
      return;
    }
    if (!reason) {
      setErrorMsg(t("select_reason") || "Please select a reason for account deletion.");
      return;
    }

    setErrorMsg("");
    setSubmitted(true);
    showToast(t("request_submitted"));
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 touch-none overscroll-none animate-in fade-in duration-200"
    >
      <div
        data-modal-scrollable="true"
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 p-6 space-y-5 bg-[#18181b] text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-lg text-rose-500 flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-500" />
            {t("delete_account")}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          /* Delete Account Form Phase */
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Warning Banner */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">{t("delete_account_warning")}</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Mobile Phone Number Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t("phone_number")} <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  className="w-32 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.dial}>
                      {c.dial} ({c.name})
                    </option>
                  ))}
                </select>
                <div className="relative flex-1 min-w-0">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s\-()]/g, ""))}
                    placeholder="555 000-0000"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Reason Selection Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t("reason_for_deletion")} <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              >
                <option value="">{t("select_reason")}</option>
                <option value="privacy">Privacy or data security concerns</option>
                <option value="distracting">Taking a break / too distracting</option>
                <option value="duplicate">Created a second account</option>
                <option value="technical">Trouble getting started / technical issues</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            {/* Additional Details (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t("additional_comments")}
              </label>
              <textarea
                rows={2}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder={t("comments_placeholder")}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold rounded-xl shadow-lg transition shadow-rose-600/20 active:scale-[0.99]"
              >
                {t("submit_request")}
              </button>
            </div>
          </form>
        ) : (
          /* Notice Modal / Confirmation Phase */
          <div className="py-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-extrabold text-white">{t("request_submitted")}</h4>
              <p className="text-sm text-slate-200 leading-relaxed font-medium px-2">
                {t("deletion_submitted_desc")}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition shadow-md"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
