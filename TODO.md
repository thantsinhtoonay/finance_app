# TODO

## In Progress

- (none)

## Completed

### Core
- [x] Build core budget tracking dashboard
- [x] Implement transaction CRUD (add, edit, delete)
- [x] Add category breakdown pie chart
- [x] Create savings goal tracker
- [x] Implement month navigation
- [x] Add filter functionality (search removed — replaced by History view)
- [x] Create category budgets with limits (Budget Limit: pre-set + remove added)
- [x] Add recurring transactions support
- [x] Build yearly overview page
- [x] Implement CSV export (Settings → Data & Export)
- [x] Add JSON backup/restore
- [x] Create quick-add for mobile (superseded by bottom-nav center + button; `quick-add-fab.tsx` is dead code)
- [x] Implement keyboard shortcuts (N, ?, Esc)
- [x] Add settings page
- [x] Create account management
- [x] Implement privacy controls
- [x] Add data management (export, import, clear)

### Platform (formerly "In Progress")
- [x] Add dark theme support — `.dark` class, Light/Dark/System setting
- [x] Change currency to Myanmar Kyat — `format.ts`
- [x] Set up GitHub repository — `origin/main`
- [x] Deploy to hosting — Vercel production, alias `northline-app-mu.vercel.app`

### Recently shipped
- [x] Full i18n (Burmese/English) — settings, nav, auth pages, categories, history
- [x] Language switch on Sign In / Sign Up pages
- [x] History view (month selector + that month's transactions)
- [x] Categories expanded — 17 expense / 9 income
- [x] Mobile polish — safe-area, floating bottom nav, stat-card wrapping
- [x] Burmese typography parity with English (Padauk only)
- [x] Budget Limit improvements — pre-set budgets, remove support, DELETE API

## Backlog (remaining)

### Features
- [x] ~~Cloud sync (requires auth)~~ — server sync via API routes + Neon Postgres
- [ ] Multi-currency support
- [ ] Shared budgets (family/team)
- [ ] Bill reminders
- [ ] Receipt scanning
- [ ] Expense categories with icons (currently colored dots only)
- [ ] Budget templates
- [ ] Financial goals (long-term)
- [ ] Debt tracking
- [ ] Investment tracking

### UI/UX
- [x] ~~Mobile responsive improvements~~ — 390px-first, breakpoints, safe-area
- [x] ~~Animations and transitions~~ — framer-motion nav/dashboard/list/pull-to-refresh
- [x] ~~Dark mode refinements~~ — theme system verified light/dark
- [ ] Accessibility enhancements (aria coverage partial — nav + budget rows done)
- [ ] Custom color themes
- [ ] Dashboard widgets
- [ ] Drill-down charts
- [ ] Touch gestures for navigation (`swipeable-transaction-item.tsx` exists but is dead code)

### Technical
- [x] ~~Database backend (PostgreSQL)~~ — Neon + `migrate.mjs`
- [x] ~~Authentication system~~ — Better Auth, multi-user, session-gated API
- [ ] Unit tests for store logic
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Performance optimization (routes chunk 747KB > 500KB warning)
- [ ] Bundle analysis
- [ ] SEO improvements
- [ ] PWA manifest (only `favicon.svg` exists — no icons/manifest)
- [ ] Offline support (localStorage persists, but no service worker)

### Documentation
- [ ] API documentation
- [ ] Component storybook
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Changelog
- [x] License file (MIT)

## Recommended next (priority order)

1. **Dead code cleanup** — delete `quick-add-fab.tsx` + `swipeable-transaction-item.tsx`; remove unused `handleExportCsv/Json/Import` and dead imports from `dashboard.tsx` (~12 lint warnings). Gets lint much closer to zero warnings.
2. **First-run experience** — seeded demo budgets (housing 2000, food 500…) are tiny/meaningless MMK values shown to new users. Remove seeds (or replace with an empty-state "Set your first budget" prompt).
3. **PWA manifest + app icons** — add 192/512px icons + manifest so users can "Add to Home Screen"; high value for mobile-first Myanmar audience.
4. **Bundle/perf pass** — split `routes` chunk (747KB); lazy-load recharts/yearly view.
5. **Recurring reminders** — recurring transactions exist but nothing surfaces upcoming bills; add a "upcoming bills" widget or notifications.
6. **Tests** — unit tests for store logic (parseAmount, summarizeMonth, budget reducers) before more features.
7. **Accessibility sweep** — dialog focus trap, aria-labels on icon-only buttons, contrast check in dark mode.
8. **Custom domain** — purchase + point at Vercel (blocked on you).

## Ideas

- **Recurring bill calendar** — Visual calendar showing upcoming bills
- **Spending insights** — AI-powered spending analysis
- **Budget sharing** — Share budgets with family members
- **Export formats** — PDF, Excel, Google Sheets integration
- **Notifications** — Browser notifications for bill reminders
- **Dark mode scheduling** — Auto-switch based on time of day
- **Custom categories** — User-defined spending categories
- **Multi-account** — Track multiple bank accounts
- **Split transactions** — Split expenses across categories
- **Reimbursement tracking** — Track work expenses for reimbursement
