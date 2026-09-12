import React from "react";
import { useTranslation } from "../store";
import { TranslationKeys } from "../types";

interface TransProps {
  i18nKey: keyof TranslationKeys;
  values?: Record<string, string | number>;
  className?: string;
  as?: React.ElementType;
}

export function Trans({
  i18nKey,
  values,
  className,
  as: Component = "span",
}: TransProps) {
  const { t } = useTranslation();
  
  let text = t(i18nKey);
  
  // Replace interpolation values
  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    });
  }
  
  return <Component className={className}>{text}</Component>;
}

// Hook for getting translated text
export function useTranslatedText(key: keyof TranslationKeys, values?: Record<string, string | number>) {
  const { t, language, isBurmese } = useTranslation();
  
  let text = t(key);
  
  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    });
  }
  
  return {
    text,
    language,
    isBurmese,
  };
}
