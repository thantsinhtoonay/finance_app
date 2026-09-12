import React from "react";
import { useTranslation } from "../store";
import { languages } from "../languages";
import { Language } from "../types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelector({ className, showLabel = true }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useTranslation();
  
  const languageOptions = Object.values(languages).map((lang) => ({
    value: lang.id,
    label: lang.name,
    nativeName: lang.nativeName,
  }));
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("settings_language")}</span>
        </div>
      )}
      
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {languageOptions.map((option) => (
          <Button
            key={option.value}
            variant={language === option.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setLanguage(option.value as Language)}
            className={cn(
              "flex-1 justify-center gap-2",
              language === option.value && "shadow-sm"
            )}
          >
            <span>{option.label}</span>
            <span className="text-xs text-muted-foreground">
              {option.nativeName}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Compact version for header/toolbar
export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useTranslation();
  
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "my" : "en");
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className={cn("size-9", className)}
      aria-label={`Switch to ${language === "en" ? "Burmese" : "English"}`}
    >
      <Globe className="size-5" />
      <span className="sr-only">
        {language === "en" ? "မြန်မာ" : "English"}
      </span>
    </Button>
  );
}
