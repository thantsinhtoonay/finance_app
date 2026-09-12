# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

**Northline Finance** — A personal finance tracking app built with React and TanStack Start. Tracks income, expenses, budgets, and savings goals with Myanmar Kyat (MMK) currency.

## Tech Stack

- **Framework:** TanStack Start (React 19)
- **Styling:** Tailwind CSS v4
- **State:** Zustand with localStorage persistence
- **Charts:** Recharts
- **UI:** Radix UI primitives + custom components
- **Icons:** Lucide React
- **Dates:** date-fns
- **Validation:** Zod

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
│   ├── settings/     # Settings store and types
│   └── utils.ts      # cn() helper and utilities
├── routes/           # TanStack Router file-based routes
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

## Styling Conventions

- Use Tailwind utility classes exclusively
- Theme tokens in `styles.css` (e.g., `text-primary`, `bg-card`)
- Dark mode via `.dark` class on `<html>` — overrides CSS custom properties
- Glass effects: `.glass` utility class
- Gradients: `.gradient-purple`, `.gradient-card`, `.gradient-hero`
- Animations: `.animate-fade-in`, `.animate-slide-up`, `.animate-scale-in`
- Components use `cn()` helper for conditional classes

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

- **No server-side auth** — All data is client-side localStorage
- **Currency is MMK** — Change in `format.ts` if needed
- **Theme persistence** — Uses `ThemeInit` component in root layout
- **Mobile-first** — Design for 390px width, scale up
- **Performance** — Use `React.memo()` for list items, `useMemo()` for calculations

## Debugging

- Check browser DevTools → Application → Local Storage
- Look for `northline-budget-v1` and `northline-settings` keys
- State is persisted — clearing localStorage resets app
- Theme applies via CSS class — check `<html>` element in DevTools
