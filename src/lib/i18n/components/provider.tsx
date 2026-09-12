import React, { useEffect } from "react";
import { useI18n } from "../store";
import { getLanguageConfig } from "../languages";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { language, setLanguage } = useI18n();
  
  useEffect(() => {
    // Apply language settings on mount
    setLanguage(language);
  }, []);
  
  return <>{children}</>;
}

// Component to apply language-specific styles to a container
export function LanguageAwareContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { language } = useI18n();
  const config = getLanguageConfig(language);
  const typography = config.typography;
  const dir = config.dir;
  
  return (
    <div
      className={className}
      dir={dir}
      lang={language}
      style={{
        fontFamily: typography.fontFamily,
        lineHeight: typography.lineHeight.normal,
        letterSpacing: typography.letterSpacing.normal,
      }}
    >
      {children}
    </div>
  );
}
