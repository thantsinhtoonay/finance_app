# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

**Shal Su** (internal codename "Northline Finance") — A full-stack personal finance tracking app built with React 19 and TanStack Start. Tracks income, expenses, budgets, and savings goals with Myanmar Kyat (MMK) currency. Authenticated (Better Auth) with server persistence (Neon Postgres) and a bilingual English/Burmese UI.

## Tech Stack

- **Framework:** TanStack Start (React 19)
- **Styling:** Tailwind CSS v4 (gold/brown theme)
- **State:** Zustand with localStorage persistence (client cache) + server sync
- **Charts:** Recharts
- **UI:** Radix UI primitives + custom components
- **Icons:** Lucide React
- **Dates:** date-fns (+ custom Burmese month names in `format.ts`)
- **Validation:** Zod
- **Auth:** Better Auth (email/password, OAuth broker for preview)
- **Database:** Neon Postgres + Kysely (PGLite fallback in preview)
- **Email:** Resend (welcome, password reset, password changed)
- **i18n:** Custom zustand-based `src/lib/i18n/` (English/Burmese)

## Commands

```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier
```

## Project Structure

```
src/
├── components/
│   ├── budget/       # App components (dashboard, settings, charts)
│   └── ui/           # Reusable primitives (button, card, dialog)
├── lib/
│   ├── budget/       # Core logic (store, types, format, categories)
│   ├── auth/         # Better Auth config, session guards, emails
│   ├── i18n/         # Translations (en/my), language store, components
│   ├── settings/     # Settings store and types
│   └── utils.ts      # cn() helper and utilities
├── routes/           # TanStack Router file-based routes
├── routes/api/       # Server API (transactions, budgets, settings, auth)
├── router.tsx        # Router config
└── styles.css        # Theme tokens and global styles
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/budget/store.ts` | Main Zustand store — transactions, budgets, goals |
| `src/lib/budget/types.ts` | TypeScript interfaces for all data models |
| `src/lib/budget/format.ts` | Currency formatting (MMK), date helpers |
| `src/lib/budget/categories.ts` | Category definitions with icons/colors |
| `src/lib/settings/store.ts` | Settings store — theme, privacy, account |
| `src/lib/settings/types.ts` | Settings type definitions |
| `src/lib/auth/server.ts` | Better Auth config — trusted origins, rate limits, DB |
| `src/lib/i18n/store.ts` | Language store — persists `northline-i18n`, sets active language for dates |
| `src/lib/i18n/translations/en.ts` / `my.ts` | Translation strings (every key must exist in both) |
| `src/components/budget/dashboard.tsx` | Main app view — orchestrates all components |
| `src/styles.css` | Theme tokens (light/dark mode via `.dark` class) |

## Data Model

```typescript
interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  date: string;        // ISO date
  recurring?: RecurringFrequency;
  receiptImage?: string; // Compressed JPEG data URL
}

interface CategoryBudget {
  category: string;
  limit: number;
  spent: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  deadline: string;
}
```

## State Management

**Budget Store** (`northline-budget-v1`):
- `transactions[]` — All income/expense entries
- `savingsGoals[]` — Savings targets with deadlines
- `categoryBudgets[]` — Per-category spending limits
- `selectedMonth` — Currently viewed month (YYYY-MM)
- `addTransaction()`, `editTransaction()`, `deleteTransaction()`
- `generateRecurringTransactions()` — Auto-create from recurring templates
- `summarizeYear()` — Aggregate monthly data for yearly view
- `exportToCsv()`, `downloadFile()` — Data export utilities

**Settings Store** (`northline-settings`):
- `account` — Name, email, avatar
- `theme` — Light, Dark, or System
- `privacy` — Hide balances, transactions, mask amounts
- `data` — Auto-backup preference

**i18n Store** (`northline-i18n`):
- `language` — `"en"` or `"my"`; `setLanguage()` also calls `setActiveLanguage()` in `format.ts` so date/month formatting localizes

**Server sync** — Zustand persists locally, then syncs to Postgres via `/api/transactions`, `/api/transactions/:id`, `/api/budgets`, `/api/settings` (session-gated; 401 anon).

## i18n Rules

- User-facing strings go through `t()` from `useTranslation()`; keys are typed `TranslationKeys` in `src/lib/i18n/types.ts`
- **Every key must exist in both `en.ts` and `my.ts`** — missing keys are typecheck errors
- No param interpolation in `t()` — use `t("key").replace("{n}", value)`
- Date localization: `formatMonth`, `formatMonthShort`, `formatDay`, `formatDayFull` in `format.ts` switch via the active language (Burmese month names are constant arrays — date-fns has no `my` locale)
- Guide page (`/user-guide`) intentionally shows bilingual body text; only chrome is translated

## Styling Conventions

- Use Tailwind utility classes exclusively
- Theme tokens in `styles.css` (e.g., `text-primary`, `bg-card`, `text-income`, `text-expense`, `--color-chart-1..8`)
- Dark mode via `.dark` class on `<html>` — overrides CSS custom properties
- Glass effects: `.glass-card` utility class
- Gradients: `.gradient-gold`, `.gradient-card`, `.text-gradient`
- Animations: `.animate-fade-in`, `.animate-slide-up`, `.animate-scale-in`
- Components use `cn()` helper for conditional classes
- Semantic income/expense colors come from tokens — never hardcode emerald/red

## Currency

Default: **Myanmar Kyat (MMK)** — whole numbers, no decimals.

Format function in `src/lib/budget/format.ts`:
```typescript
formatMoney(value: number) // Returns "K 1,500,000" or "−K 500,000"
```

## Common Tasks

### Add a new component
1. Create in `src/components/budget/` or `src/components/ui/`
2. Import in parent component
3. Use existing UI primitives (Button, Card, Badge, etc.)

### Add a new store action
1. Add to `src/lib/budget/store.ts`
2. Update types in `src/lib/budget/types.ts` if needed
3. Export from store

### Add a new route
1. Create file in `src/routes/`
2. Use `createFileRoute()` pattern
3. Import in router if needed

### Modify theme
1. Edit CSS custom properties in `src/styles.css`
2. Light mode: root `:root` block
3. Dark mode: `.dark` class overrides

### Add a new chart
1. Use Recharts components
2. Import from `recharts`
3. Follow existing chart patterns in `src/components/budget/`

## Important Notes

- **Auth is enforced** — API routes require a session (`requireApiUser()` → 401); production domain is `https://shal-su.thantsin.website` (new origins must be added to `CUSTOM_APP_ORIGINS` in `src/lib/auth/server.ts`)
- **Currency is MMK by default** — switchable via settings; format in `format.ts`
- **Theme persistence** — Uses `ThemeInit` component in root layout
- **Mobile-first** — Design for 390px width, scale up
- **Performance** — Use `React.memo()` for list items, `useMemo()` for calculations; heavy views (charts/history/yearly/settings) are lazy-loaded

## Debugging

- Check browser DevTools → Application → Local Storage
- Look for `northline-budget-v1` and `northline-settings` keys
- State is persisted — clearing localStorage resets app
- Theme applies via CSS class — check `<html>` element in DevTools
