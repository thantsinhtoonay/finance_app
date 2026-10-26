# Changelog

All notable changes to Shal Su (Northline Finance) will be documented in this file.

## [2.0.0] - 2026-10-26

### Added
- **Authentication & cloud sync** — Better Auth email/password, session-gated API, Neon Postgres persistence, forgot/reset password flow, transactional emails via Resend (welcome, reset link, password changed)
- **Receipt photos** — attach compressed receipt images to income/expense entries
- **Income-first expense gate** — expenses locked (UI + server 409) until first income
- **Recurring transactions server materialization** — idempotent generation with tombstones
- **PDF export** — branded monthly / all-transactions reports
- **User guide** — built-in bilingual guide at `/user-guide`
- **Full bilingual i18n (English/Burmese)** — settings, yearly overview, dates/month names, auth pages, aria-labels, dialogs; live language switch everywhere; type-enforced translation keys
- **Security hardening** — strict CSP/HSTS headers, DB-backed rate limiting, input validation (Zod), generic 500s, CSV formula-injection escaping, email-change verification
- **Performance** — lazy-loaded chart/history/yearly/settings views, smaller logo, cached images

### Changed
- **Domain** — production primary is now `https://shal-su.thantsin.website` (Burmese "Theme" label, token-based income/expense colors, mobile responsive fixes, budget badge overlap fix)

## [1.0.0] - 2026-09-12

### Added

#### Core Features
- Dashboard with remaining balance, income, and expenses overview
- Transaction management (add, edit, delete income/expense)
- Category breakdown pie chart visualization
- Savings goal tracker with progress bar
- Month navigation to browse past budgets
- Persistent data storage using localStorage

#### Advanced Features
- Search and filter transactions by note or category
- Category budgets with spending limits and warnings
- Recurring transactions (weekly, bi-weekly, monthly, yearly)
- Yearly overview with monthly income/expense bar chart
- CSV export for spreadsheet analysis
- JSON backup and restore functionality
- Quick-add floating action button for mobile
- Keyboard shortcuts (N, /, ?, Esc)

#### Settings
- Account management (name, email, avatar)
- Dark/Light/System theme toggle with persistence
- Privacy controls (hide balances, transactions, mask amounts)
- Data management (export, import, clear all data)

#### UI/UX
- Purple/violet Plum-inspired design system
- Responsive layout for mobile and desktop
- Glass morphism effects
- Smooth animations and transitions
- Custom gradient cards and buttons

#### Technical
- React 19 with TanStack Start/Router
- Tailwind CSS v4 for styling
- Zustand for state management with persistence
- Recharts for data visualization
- Radix UI for accessible components
- Myanmar Kyat (MMK) currency support

### Fixed
- Windows spawn error in build scripts
- Theme persistence on page reload
- Mobile navigation with settings tab

## [0.1.0] - Unreleased

### Planned
- Cloud sync with authentication
- Multi-currency support
- Bill reminders and notifications
- Receipt scanning
- Investment tracking
