import * as Localization from "expo-localization";
import { translations, type Language } from "./translations";

const SUPPORTED: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];

function getLanguage(): Language {
  const locale = Localization.getLocales()[0]?.languageCode ?? "en";
  return SUPPORTED.includes(locale as Language) ? (locale as Language) : "en";
}

export const lang = getLanguage();
export const isRTL = lang === "ar";

const dict = translations[lang];

export function t(key: string, vars?: Record<string, string | number>): string {
  const keys = key.split(".");
  let value: unknown = dict;
  for (const k of keys) {
    if (typeof value === "object" && value !== null) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  if (typeof value !== "string") return key;
  if (!vars) return value;
  return Object.entries(vars).reduce(
    (str, [k, v]) => str.replaceAll(`{{${k}}}`, String(v)),
    value,
  );
}
