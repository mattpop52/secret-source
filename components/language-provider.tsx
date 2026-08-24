"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  getLanguage,
  isLanguageCode,
  type LanguageCode,
} from "@/lib/i18n";
import {
  type TranslationKey,
  t as translate,
  translateCategoryName,
} from "@/lib/i18n-strings";

const STORAGE_KEY = "secret-source-language-v1";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  categoryName: (slug: string, fallback: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw && isLanguageCode(raw) ? raw : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Starts English so the server-rendered markup and the first client
  // render match; the stored choice (if any) applies right after — the
  // same hydration trade-off the cart and currency providers make.
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLanguageState(readStoredLanguage());
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private mode or blocked storage — the choice just won't persist.
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );

  const categoryName = useCallback(
    (slug: string, fallback: string) =>
      translateCategoryName(language, slug, fallback),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, categoryName }),
    [language, setLanguage, t, categoryName],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }

  return context;
}

export { getLanguage };
