import React from "react";
import { useTranslation } from "../store";
import { languages } from "../languages";
import { Language } from "../types";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function LanguageToggle({
  className,
  size = "md",
  showLabels = true,
}: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation();

  const sizeClasses = {
    sm: "h-8 w-[120px]",
    md: "h-10 w-[160px]",
    lg: "h-12 w-[200px]",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "my" : "en");
  };

  return (
    <div className={cn("relative", className)}>
      {showLabels && (
        <div className="mb-2 flex items-center justify-between">
          <span
            className={cn(
              "font-medium transition-colors",
              textSizes[size],
              language === "en" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            English
          </span>
          <span
            className={cn(
              "font-medium transition-colors",
              textSizes[size],
              language === "my" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            မြန်မာ
          </span>
        </div>
      )}

      <button
        onClick={toggleLanguage}
        className={cn(
          "relative flex items-center rounded-full border border-border bg-card p-1 transition-all duration-300 hover:border-primary/50 hover:shadow-md",
          sizeClasses[size]
        )}
        aria-label={`Switch to ${language === "en" ? "Burmese" : "English"}`}
      >
        {/* Background slider */}
        <div
          className={cn(
            "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary transition-all duration-300 ease-out",
            language === "my" ? "left-[calc(50%+2px)]" : "left-1"
          )}
        />

        {/* English option */}
        <div
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 transition-colors duration-300",
            language === "en" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <span className={cn("font-semibold", textSizes[size])}>EN</span>
        </div>

        {/* Burmese option */}
        <div
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 transition-colors duration-300",
            language === "my" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <span className={cn("font-semibold", textSizes[size])}>MY</span>
        </div>
      </button>
    </div>
  );
}

// Pill-style toggle with flags/icons
export function LanguagePillToggle({
  className,
}: {
  className?: string;
}) {
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "my" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "group relative flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition-all duration-300 hover:border-primary/50 hover:shadow-md",
        className
      )}
      aria-label={`Switch to ${language === "en" ? "Burmese" : "English"}`}
    >
      {/* Globe icon */}
      <svg
        className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>

      {/* Current language label */}
      <span className="text-sm font-medium">
        {language === "en" ? "English" : "မြန်မာ"}
      </span>

      {/* Arrow indicator */}
      <svg
        className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

// Icon-only toggle with tooltip
export function LanguageIconToggle({
  className,
}: {
  className?: string;
}) {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "my" : "en");
  };

  return (
    <div className={cn("relative group", className)}>
      <button
        onClick={toggleLanguage}
        className={cn(
          "flex size-10 items-center justify-center rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-md",
          "active:scale-95"
        )}
        aria-label={`Switch to ${language === "en" ? "Burmese" : "English"}`}
      >
        <span className="text-sm font-bold">{language === "en" ? "EN" : "MY"}</span>
      </button>

      {/* Tooltip */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
        {language === "en" ? "Switch to Burmese" : "Switch to English"}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  );
}
