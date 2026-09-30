import { Language, LanguageConfig, TypographyConfig } from "./types";

const englishTypography: TypographyConfig = {
  fontFamily: '"Inter", "SF Pro Display", ui-sans-serif, system-ui, sans-serif',
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
  },
};

// Burmese keeps the same sizes/spacing/line-heights as English — only the font differs
const burmeseTypography: TypographyConfig = {
  fontFamily: '"Padauk", "Myanmar3", "Unicode Myanmar", ui-sans-serif, system-ui, sans-serif',
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
  },
};

export const languages: Record<Language, LanguageConfig> = {
  en: {
    id: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    typography: englishTypography,
  },
  my: {
    id: "my",
    name: "Burmese",
    nativeName: "မြန်မာ",
    dir: "ltr",
    typography: burmeseTypography,
  },
};

export const defaultLanguage: Language = "en";

export function getLanguageConfig(lang: Language): LanguageConfig {
  return languages[lang] || languages[defaultLanguage];
}

export function getTypographyClasses(lang: Language): string {
  const config = getLanguageConfig(lang);
  const t = config.typography;
  
  return [
    `font-[${t.fontFamily}]`,
    `leading-[${t.lineHeight.normal}]`,
    `tracking-[${t.letterSpacing.normal}]`,
  ].join(" ");
}

export function getLanguageDir(lang: Language): "ltr" | "rtl" {
  return languages[lang]?.dir || "ltr";
}
