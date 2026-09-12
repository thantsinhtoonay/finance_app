# Burmese i18n Skill

A local internationalization skill for Burmese language support with proper typography handling.

## Overview

Burmese script (Myanmar) requires special typography considerations:
- **More vertical space** — Burmese characters are taller and more complex
- **Larger font sizes** — For proper readability
- **Different line-height** — Burmese needs 1.8-2.0 vs English's 1.5
- **No letter-spacing** — Burmese doesn't benefit from letter-spacing adjustments

This skill provides language-aware components that automatically adjust typography based on the selected language.

## Installation

The skill is located at `src/lib/i18n/` and is self-contained.

### Files

```
src/lib/i18n/
├── index.ts              # Main exports
├── types.ts              # TypeScript definitions
├── languages.ts          # Language configurations
├── store.ts              # Zustand store for i18n state
├── translations/
│   ├── index.ts          # Translation aggregator
│   ├── en.ts             # English translations
│   └── my.ts             # Burmese translations
└── components/
    ├── index.ts          # Component exports
    ├── text.tsx          # Typography components
    ├── trans.tsx         # Translation components
    ├── language-selector.tsx  # Language switcher
    └── provider.tsx      # i18n provider
```

## Usage

### 1. Basic Translation

```tsx
import { useTranslation } from "@/lib/i18n";

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t("app_name")}</h1>;
}
```

### 2. Language-Aware Typography

```tsx
import { Text, Heading } from "@/lib/i18n";

function MyComponent() {
  return (
    <Text size="base" weight="normal">
      This text automatically adjusts for Burmese
    </Text>
    
    <Heading level={2}>
      Headers also adjust
    </Heading>
  );
}
```

### 3. Language Selector

```tsx
import { LanguageSelector, LanguageToggle } from "@/lib/i18n";

function Settings() {
  return (
    // Full selector with labels
    <LanguageSelector showLabel={true} />
    
    // Compact toggle button
    <LanguageToggle />
  );
}
```

### 4. Trans Component

```tsx
import { Trans } from "@/lib/i18n";

function MyComponent() {
  return (
    <Trans i18nKey="savings_days_left" values={{ count: 5 }} />
  );
}
```

### 5. Language-Aware Container

```tsx
import { LanguageAwareContainer } from "@/lib/i18n";

function MyComponent() {
  return (
    <LanguageAwareContainer className="p-4">
      {/* All children inherit language typography */}
      <p>This paragraph uses Burmese typography when selected</p>
    </LanguageAwareContainer>
  );
}
```

## Typography Rules

### Burmese (my)

| Property | Value |
|----------|-------|
| Font Family | Padauk, Myanmar3, Unicode Myanmar |
| Line Height | 1.8 (normal), 2.0 (relaxed) |
| Font Size | 6.25% larger than English |
| Letter Spacing | 0.01em |

### English (en)

| Property | Value |
|----------|-------|
| Font Family | Inter, SF Pro Display |
| Line Height | 1.5 (normal), 1.75 (relaxed) |
| Font Size | Base sizes |
| Letter Spacing | 0em |

## Adding New Languages

### 1. Update Types

Add the language to `Language` type in `types.ts`:

```typescript
export type Language = "en" | "my" | "th"; // Add Thai
```

### 2. Add Typography Config

Add language configuration in `languages.ts`:

```typescript
const thaiTypography: TypographyConfig = {
  fontFamily: '"Sarabun", sans-serif',
  lineHeight: {
    tight: "1.4",
    normal: "1.6",
    relaxed: "1.8",
  },
  // ... other config
};
```

### 3. Create Translation File

Create `translations/th.ts`:

```typescript
import { TranslationKeys } from "../types";

export const th: TranslationKeys = {
  app_name: "Northline",
  save: "บันทึก",
  // ... all translations
};
```

### 4. Update Translations Index

Add to `translations/index.ts`:

```typescript
import { th } from "./th";

export const translations: Record<Language, TranslationKeys> = {
  en,
  my,
  th, // Add here
};
```

### 5. Add CSS Styles

Add language-specific styles in `styles.css`:

```css
[lang="th"] {
  font-family: var(--font-thai);
  line-height: 1.6;
}
```

## Key Features

### 1. Automatic Typography Adjustment

The `Text` component automatically adjusts:
- Line height for Burmese (1.8 vs 1.5)
- Font sizes (6.25% larger for Burmese)
- Font family (Padauk for Burmese)

### 2. Persistent Language Choice

Language selection is saved in localStorage under `northline-i18n` key.

### 3. Document Language Attribute

The `<html lang="">` attribute is automatically updated when language changes.

### 4. Font Loading

Padauk font is loaded from Google Fonts in the root layout.

## CSS Classes

The skill adds these utility classes:

| Class | English | Burmese |
|-------|---------|---------|
| `.lang-tight` | 1.25 | 1.6 |
| `.lang-normal` | 1.5 | 1.8 |
| `.lang-relaxed` | 1.75 | 2.0 |

## Notes

- **Burmese text doesn't need letter-spacing** — The script handles spacing naturally
- **Font size increase is necessary** — Burmese characters are more complex
- **Line height is critical** — Too tight causes overlapping ascenders/descenders
- **Test with real content** — Always verify with actual Burmese text
