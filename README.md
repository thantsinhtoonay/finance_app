A complete personal finance tracker — income, expenses, budgets, and a live remaining balance.

**Live:** https://shal-su.thantsin.website (auto-deploys from `main`)

## Features

### Core
- **Dashboard** — See your remaining balance, income, expenses, and goal progress at a glance
- **Transaction Management** — Add, edit, and delete income/expense entries
- **Receipt Photos** — Attach a receipt image to any income/expense entry (auto-compressed on your device, viewable later in the entry editor)
- **Income-First Expense Gate** — Expenses are locked until the first income is recorded (UI lock + server-side 409 gate on API, import, and recurring materialization)
- **Category Breakdown** — Visual pie chart showing spending by category
- **Savings Goal** — Set and track monthly savings targets with progress bar
- **Month Navigation** — Browse through months to review past budgets
- **Multi-User Accounts** — Email/password auth (Better Auth) with session-gated API; forgot/reset password flow with email reset link
- **Transactional Emails** — Resend-powered: signup welcome (account/region/device), password-reset link, password-changed notices (`no-reply@thantsin.website`)
- **Cloud Sync** — Data persisted server-side in Neon Postgres; local cache keeps the app usable offline
- **Bilingual UI (English / Burmese)** — Live language switch on every page (header, settings, auth pages, user guide); localized dates, month names, and numerals

### Advanced
- **Search & Filter** — Find transactions by note or category name
- **Category Budgets** — Set spending limits per category with visual warnings when approaching or exceeding limits
- **Recurring Transactions** — Mark transactions as weekly, bi-weekly, monthly, or yearly recurring
- **Yearly Overview** — Annual summary with monthly income/expense bar chart and top spending categories
- **CSV Export** — Export monthly or all transactions to CSV for spreadsheet analysis
- **JSON Backup/Restore** — Full data backup and import for data portability
- **PDF Export** — Monthly or all-transactions report (branded header, income/expense summary, category table)
- **User Guide** — Built-in bilingual guide at `/user-guide`
- **Keyboard Shortcuts** — `N` to add, `/` to search, `?` for help, `Esc` to close

## Tech Stack

- React 19
- TanStack Start / Router / Query
- Tailwind CSS v4
- Recharts (charts)
- Zustand (state management, localStorage cache)
- Radix UI (components)
- Better Auth (authentication)
- Resend (transactional email)
- Neon Postgres + Kysely (server database)
- Zod (input validation)
- framer-motion (animations)
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
| `npm run build` | Production build + DB migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Type checking |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Test suite (92 tests: auth gates, validation, recurring, income gate, format, device-info) |
| `npm run check:auth` | Auth invariant check |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Add new transaction |
| `/` | Focus search input |
| `?` | Toggle keyboard shortcuts help |
| `Esc` | Close dialog / clear search |

## Data Export

- **CSV** — Settings → Data & Export: current month or all transactions
- **PDF** — Settings → Data & Export: branded monthly or all-transactions report
- **JSON Backup** — Export full data including budgets, goals, and receipt images via the header menu
- **Import** — Restore from a JSON backup file
