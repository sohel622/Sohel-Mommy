import { useState } from "react";
import { useApp } from "@/lib/instagram/context";
import { ArrowLeft, LogOut, Camera, Upload, Check } from "lucide-react";
import { fileToBase64 } from "@/lib/instagram/media";
import { presetAvatars, DEFAULT_AVATAR } from "@/lib/instagram/data";

export function AccountView() {
  const { user, setUser, setView, showToast, logout, t } = useApp();
  const [form, setForm] = useState(user);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToBase64(file);
      setForm((prev) => ({ ...prev, avatar: dataUrl }));
      showToast("Photo selected. Click 'Save Changes' to update profile.");
    } catch {
      showToast("Failed to process image file.");
    }
  };

  const save = () => {
    setUser(form);
    showToast("Profile saved successfully");
    setView("profile");
  };

  return (
    <section className="w-full max-w-[630px] mx-auto glass-card rounded-none md:rounded-2xl overflow-hidden shadow-xl text-slate-100">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("profile")}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg text-white">{t("account")}</h2>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Profile Picture Upload Section */}
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t("change_avatar")}
          </h3>

          <div className="relative inline-block">
            <img
              src={form.avatar || DEFAULT_AVATAR}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-2xl mx-auto ring-2 ring-pink-500/30"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-pink-600 hover:bg-pink-500 text-white rounded-full cursor-pointer shadow-lg transition border-2 border-slate-900">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <label className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 font-semibold text-xs rounded-xl cursor-pointer transition flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" />
              Upload New Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Preset Avatars Selection */}
          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">
              Or pick an avatar preset:
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {presetAvatars.map((url, idx) => {
                const isSelected = form.avatar === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, avatar: url }))}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                      isSelected
                        ? "border-pink-500 ring-2 ring-pink-500/50 scale-105"
                        : "border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Preset ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-pink-500/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white font-bold" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <Field
            label={t("username")}
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
          />
          <Field
            label={t("full_name")}
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
          />
          <Field
            label={t("bio")}
            value={form.bio}
            onChange={(v) => setForm({ ...form, bio: v })}
            multiline
          />
          <Field
            label={t("location")}
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
          />
        </div>

        <button
          onClick={save}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold rounded-xl shadow-lg hover:from-pink-600 hover:to-rose-600 transition shadow-pink-500/20 active:scale-[0.99]"
        >
          {t("save_changes")}
        </button>

        <button
          onClick={logout}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-500"
        />
      )}
    </label>
  );
}
