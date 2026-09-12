import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language } from "./types";
import { getLanguageConfig, defaultLanguage } from "./languages";
import { getTranslation, getAllTranslations } from "./translations";

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof ReturnType<typeof getAllTranslations>) => string;
  getTypography: () => ReturnType<typeof getLanguageConfig>["typography"];
  getDir: () => "ltr" | "rtl";
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: defaultLanguage,
      
      setLanguage: (lang: Language) => {
        set({ language: lang });
        
        // Update document lang attribute
        if (typeof document !== "undefined") {
          document.documentElement.lang = lang;
          
          // Update font class on body
          const config = getLanguageConfig(lang);
          document.body.style.fontFamily = config.typography.fontFamily;
          document.body.style.lineHeight = config.typography.lineHeight.normal;
        }
      },
      
      t: (key: keyof ReturnType<typeof getAllTranslations>) => {
        const { language } = get();
        return getTranslation(language, key);
      },
      
      getTypography: () => {
        const { language } = get();
        return getLanguageConfig(language).typography;
      },
      
      getDir: () => {
        const { language } = get();
        return getLanguageConfig(language).dir;
      },
    }),
    {
      name: "northline-i18n",
      onRehydrateStorage: () => (state) => {
        // Apply language settings on rehydrate
        if (state?.language && typeof document !== "undefined") {
          const config = getLanguageConfig(state.language);
          document.documentElement.lang = state.language;
          document.body.style.fontFamily = config.typography.fontFamily;
          document.body.style.lineHeight = config.typography.lineHeight.normal;
        }
      },
    }
  )
);

// Helper hook for components
export function useTranslation() {
  const { t, language, setLanguage, getTypography, getDir } = useI18n();
  
  return {
    t,
    language,
    setLanguage,
    typography: getTypography(),
    dir: getDir(),
    isBurmese: language === "my",
  };
}
