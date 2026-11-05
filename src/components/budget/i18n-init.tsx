import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/store";

export function I18nInit() {
  const language = useI18n((s) => s.language);
  const setLanguage = useI18n((s) => s.setLanguage);

  useEffect(() => {
    // Safety net only: persist's onRehydrateStorage normally applies the saved
    // language (lang attr + body fonts) before React mounts. Re-applying the
    // same language unconditionally used to force an extra full-tree render on
    // every first paint — only call setLanguage when something is actually off.
    if (document.documentElement.lang !== language) setLanguage(language);
  }, [language, setLanguage]);

  return null;
}
