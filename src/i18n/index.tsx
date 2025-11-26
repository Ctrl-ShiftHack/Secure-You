import React, { createContext, useContext, useEffect, useState } from "react";

import en from "./locales/en.json";
import es from "./locales/es.json";
import bn from "./locales/bn.json";

type Locales = "en" | "es" | "bn";

const LOCALES: Record<Locales, any> = { en, es, bn };

type I18nContextType = {
  locale: Locales;
  t: (path: string) => any;
  setLocale: (l: Locales) => void;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locales>((localStorage.getItem("locale") as Locales) || "en");

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const setLocale = (l: Locales) => setLocaleState(l);

  const t = (path: string) => {
    const parts = path.split(".");
    let cur: any = LOCALES[locale];
    for (const p of parts) {
      if (!cur) return path;
      cur = cur[p];
    }
    return cur;
  };

  return <I18nContext.Provider value={{ locale, t, setLocale }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

export const availableLocales: { code: Locales; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "bn", label: "বাংলা" },
];
