import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/store";

export function I18nInit() {
  const { language, setLanguage } = useI18n();
  
  useEffect(() => {
    // Apply saved language settings on mount
    setLanguage(language);
  }, []);
  
  return null;
}
