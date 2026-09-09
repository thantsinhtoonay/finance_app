# Northline

A complete personal finance tracker — income, expenses, budgets, and a live remaining balance.

## Features

### Core
- **Dashboard** — See your remaining balance, income, expenses, and goal progress at a glance
- **Transaction Management** — Add, edit, and delete income/expense entries
- **Category Breakdown** — Visual pie chart showing spending by category
- **Savings Goal** — Set and track monthly savings targets with progress bar
- **Month Navigation** — Browse through months to review past budgets
- **Persistent Data** — Budget data saved locally in your browser

### Advanced
- **Search & Filter** — Find transactions by note or category name
- **Category Budgets** — Set spending limits per category with visual warnings when approaching or exceeding limits
- **Recurring Transactions** — Mark transactions as weekly, bi-weekly, monthly, or yearly recurring
- **Yearly Overview** — Annual summary with monthly income/expense bar chart and top spending categories
- **CSV Export** — Export monthly or all transactions to CSV for spreadsheet analysis
- **JSON Backup/Restore** — Full data backup and import for data portability
- **Quick-Add FAB** — Floating action button for fast expense entry on mobile
- **Keyboard Shortcuts** — `N` to add, `/` to search, `?` for help, `Esc` to close

## Tech Stack

- React 19
- TanStack Start / Router
- Tailwind CSS v4
- Recharts (charts)
- Zustand (state management)
- Radix UI (components)
- date-fns (date utilities)

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:8080`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Type checking |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Add new transaction |
| `/` | Focus search input |
| `?` | Toggle keyboard shortcuts help |
| `Esc` | Close dialog / clear search |

## Data Export

- **CSV** — Click the download icon to export the current month's transactions
- **JSON Backup** — Export full data including budgets and settings via the header menu
- **Import** — Restore from a JSON backup file
