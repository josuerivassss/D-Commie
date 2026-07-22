import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, LOCALES } from "../locales";

const LocaleContext = createContext(null);

function resolveKey(dict, key) {
  let value = dict;
  for (const part of key.split(".")) {
    if (value == null || typeof value !== "object") return undefined;
    value = value[part];
  }
  return typeof value === "string" ? value : undefined;
}

function interpolate(text, params) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/** Mirrors the bot's own Locale.get(key, **placeholders) pattern
 * (src/bcommie/locale.py): dotted-key lookup + {placeholder} interpolation.
 * Falls back to DEFAULT_LOCALE for any key missing in the active language
 * -- so a partially-translated new language degrades gracefully instead of
 * showing raw key names everywhere. */
export function LocaleProvider({ language, children }) {
  const t = useMemo(() => {
    const dict = LOCALES[language] || LOCALES[DEFAULT_LOCALE];
    const fallbackDict = LOCALES[DEFAULT_LOCALE];
    return (key, params) => {
      const raw = resolveKey(dict, key) ?? resolveKey(fallbackDict, key);
      if (raw === undefined) return `[${key}]`;
      return interpolate(raw, params);
    };
  }, [language]);

  return <LocaleContext.Provider value={{ t, language }}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useTranslation must be used inside LocaleProvider");
  return ctx;
}