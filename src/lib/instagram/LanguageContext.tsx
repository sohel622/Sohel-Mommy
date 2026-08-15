import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGES,
  translateKey,
  type TranslationKeys,
  type LanguageDictionary,
} from "./translations";

export interface LanguageContextType {
  language: string;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKeys | string, defaultText?: string) => string;
  languages: string[];
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "ig_language";

export function LanguageProvider({
  children,
  initialLanguage = "English (US)",
}: {
  children: ReactNode;
  initialLanguage?: string;
}) {
  const [language, setLanguageState] = useState<string>(initialLanguage);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (LANGUAGES as readonly string[]).includes(stored)) {
        setLanguageState(stored);
      }
    } catch {
      // ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && (LANGUAGES as readonly string[]).includes(e.newValue)) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKeys | string, defaultText?: string): string => {
      return translateKey(key, language, defaultText);
    },
    [language],
  );

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      currentLanguage: language,
      setLanguage,
      t,
      languages: LANGUAGES as unknown as string[],
    }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Graceful fallback if called outside LanguageProvider: read from localStorage or default
    let activeLang = "English (US)";
    try {
      activeLang = localStorage.getItem(STORAGE_KEY) || "English (US)";
    } catch {
      // ignore
    }
    return {
      language: activeLang,
      currentLanguage: activeLang,
      setLanguage: (lang: string) => {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
        } catch {
          // ignore
        }
      },
      t: (key: TranslationKeys | string, defaultText?: string) => translateKey(key, activeLang, defaultText),
      languages: LANGUAGES as unknown as string[],
    };
  }
  return ctx;
}
