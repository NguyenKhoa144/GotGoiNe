"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "vi" | "en";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "gotgoine-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Mặc định "vi" cho lần render đầu (khớp server/client, tránh hydration
  // mismatch) — đọc lựa chọn đã lưu trong localStorage sau khi mount.
  const [lang, setLangState] = useState<Lang>("vi");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "vi" || saved === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
