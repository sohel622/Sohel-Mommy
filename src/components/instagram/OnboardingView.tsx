import { useState } from "react";
import { Camera, ImageIcon, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/instagram/context";
import { fileToBase64 } from "@/lib/instagram/media";
import { LANGUAGES } from "./translations";
import { COUNTRIES } from "./countries";

/** 3-step post-signup profile setup: media → personal info → country/language. */
export function OnboardingView() {
  const { user, completeOnboarding, setLanguage, language: currentLang, showToast, t } = useApp();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(user.avatar);
  const [banner, setBanner] = useState(user.coverPhoto);
  const [fullName, setFullName] = useState(user.fullName || "");
  const [dial, setDial] = useState("+91");
  const [phone, setPhone] = useState(user.phone?.replace(/^\+\d+\s*/, "") || "");
  const [country, setCountry] = useState(user.country || "India");
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang || "English (US)");
  const [validationError, setValidationError] = useState<string | null>(null);

  const pick = (set: (v: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      set(await fileToBase64(file));
    };
    input.click();
  };

  const handleCountryChange = (countryName: string) => {
    setCountry(countryName);
    const found = COUNTRIES.find((c) => c.name === countryName);
    if (found) {
      setDial(found.dial);
      if (found.defaultLang && LANGUAGES.includes(found.defaultLang)) {
        setSelectedLanguage(found.defaultLang);
      }
    }
  };

  const handleStepNext = () => {
    setValidationError(null);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim();

      if (!cleanName || cleanName.length < 2) {
        setValidationError(t("name_phone_required"));
        return;
      }
      if (!cleanPhone || cleanPhone.length < 5) {
        setValidationError(t("name_phone_required"));
        return;
      }

      setStep(3);
    } else if (step === 3) {
      finish();
    }
  };

  const finish = () => {
    const cleanPhone = phone.trim() ? `${dial} ${phone.trim()}` : undefined;
    completeOnboarding({
      avatar,
      coverPhoto: banner,
      fullName: fullName.trim() || user.fullName,
      phone: cleanPhone,
      country,
      language: selectedLanguage,
    });
    setLanguage(selectedLanguage);
    showToast("Profile setup complete");
  };

  const isStep2Valid = fullName.trim().length >= 2 && phone.trim().length >= 5;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-white dark:bg-black text-slate-900 dark:text-slate-100 overflow-y-auto touch-pan-y">
      {/* Progress Header */}
      <div className="px-6 pt-8 pb-3 max-w-lg w-full mx-auto">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest opacity-60">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? "1/3" : step === 2 ? "2/3" : "3/3"}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-neutral-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#EC4899] to-[#FF007F] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 px-6 py-4 space-y-6 max-w-lg w-full mx-auto">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{t("add_your_photos")}</h2>
              <p className="text-xs opacity-60 mt-1">
                Personalize how other creators see your profile.
              </p>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                {t("header_banner")}
              </span>
              <button
                type="button"
                onClick={() => pick(setBanner)}
                className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 transition hover:opacity-95 group"
              >
                <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-semibold group-hover:bg-black/85 transition">
                  <ImageIcon className="w-3.5 h-3.5" /> {t("header_banner")}
                </span>
              </button>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => pick(setAvatar)}
                className="relative flex-shrink-0 group cursor-pointer"
                title={t("tap_to_upload_avatar")}
              >
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-neutral-900 shadow-xl"
                />
                <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-white shadow group-hover:bg-pink-600 transition">
                  <Camera className="w-3.5 h-3.5" />
                </span>
              </button>
              <div>
                <p className="text-sm font-semibold">{t("change_avatar")}</p>
                <p className="text-xs opacity-60 mt-0.5">{t("tap_to_upload_avatar")}</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{t("tell_us_about_you")}</h2>
              <p className="text-xs opacity-60 mt-1">
                Please enter your name and verified phone number.
              </p>
            </div>

            {validationError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                {t("full_name")} <span className="text-pink-500">*</span>
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Alex Rivera"
                className={`w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                  validationError && (!fullName.trim() || fullName.trim().length < 2)
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-200 dark:border-neutral-800"
                }`}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                {t("phone_number")} <span className="text-pink-500">*</span>
              </span>
              <div className="flex gap-2">
                <select
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  className="w-32 px-3 py-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.dial}>
                      {c.dial} ({c.name})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^\d]/g, ""));
                    if (validationError) setValidationError(null);
                  }}
                  inputMode="tel"
                  placeholder="Mobile number"
                  className={`flex-1 min-w-0 px-4 py-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition ${
                    validationError && (!phone.trim() || phone.trim().length < 5)
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-200 dark:border-neutral-800"
                  }`}
                />
              </div>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {t("country_and_language")}
              </h2>
              <p className="text-xs opacity-60 mt-1">
                Select your country and preferred application interface language.
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                {t("country")}
              </span>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                {t("app_language")}
              </span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 text-xs space-y-1.5">
              <div className="font-semibold text-slate-800 dark:text-neutral-200">
                Active Locale: <span className="font-bold text-pink-500">{selectedLanguage}</span>
              </div>
              <p className="opacity-60">
                Content and navigation will be presented in {selectedLanguage}. You can change this
                at any time in Settings.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 pb-10 pt-2 flex gap-3 max-w-lg w-full mx-auto">
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              setValidationError(null);
              setStep((s) => s - 1);
            }}
            className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 font-semibold text-sm transition"
          >
            {t("back")}
          </button>
        )}
        <button
          type="button"
          onClick={handleStepNext}
          className={`flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF007F] text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition active:scale-[0.99] ${
            step === 2 && !isStep2Valid ? "opacity-90 cursor-pointer" : ""
          }`}
        >
          {step < 3 ? t("continue") : t("finish_setup")}
        </button>
      </div>
    </div>
  );
}
