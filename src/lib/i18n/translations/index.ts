import { Language, TranslationKeys } from "../types";
import { en } from "./en";
import { my } from "./my";

export const translations: Record<Language, TranslationKeys> = {
  en,
  my,
};

export function getTranslation(lang: Language, key: keyof TranslationKeys): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

export function getAllTranslations(lang: Language): TranslationKeys {
  return translations[lang] || translations.en;
}
