// Types
export type { Language, LanguageConfig, TypographyConfig, TranslationKeys } from "./types";

// Languages
export { languages, defaultLanguage, getLanguageConfig, getTypographyClasses, getLanguageDir } from "./languages";

// Store
export { useI18n, useTranslation } from "./store";

// Translations
export { translations, getTranslation, getAllTranslations } from "./translations";

// Components
export {
  Text,
  Heading,
  Label,
  Caption,
  Trans,
  useTranslatedText,
  LanguageSelector,
  LanguageToggle,
  I18nProvider,
  LanguageAwareContainer,
} from "./components";
