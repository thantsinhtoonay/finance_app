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
- [x] Deploy to hosting — Vercel production, primary domain **`https://shal-su.vercel.app`** (custom `thantsin.website` domains removed from Vercel; git auto-deploy from `origin/main`)

### Recently shipped
- [x] Telegram-only Mini App conversion (`4f840e6`) — email/password sign-in/sign-up removed; auto account creation from validated Mini App `initData` (`POST /api/auth/telegram/webapp`); landing page outside Telegram; bot `/start` + menu button open the app
- [x] Full i18n (Burmese/English) — settings, nav, auth pages, categories, history
- [x] Language switch on Sign In / Sign Up pages
- [x] History view (month selector + that month's transactions)
- [x] Categories expanded — 17 expense / 9 income
- [x] Mobile polish — safe-area, floating bottom nav, stat-card wrapping
- [x] Burmese typography parity with English (Padauk only)
- [x] Budget Limit improvements — pre-set budgets, remove support, DELETE API

### Bug fixes (`ae130f2`) — all 9 verified in prod
- [x] Privacy settings row (div → semantic buttons)
- [x] Change-email enabled (`changeEmail` handler)
- [x] "Clear all data" resets savings goal + category budgets (not just transactions)
- [x] Save rollback on failed transaction update
- [x] Recurring transactions actually generate — `0003_recurring.sql`, `recurring.ts`, GET materialization, idempotent + tombstones (12 tests)
- [x] API routes return JSON 405 (not HTML) for wrong methods; `/api/auth/*` DELETE handled by Better Auth
- [x] Themed branded 404 page
- [x] CSV export: stable sort (copy before sort) + formula-injection escaping (`csvCell`)
- [x] Real sign-in error message instead of silent failure

### Security hardening (`280b213`, `8171a0e`) — security review complete
- [x] Strict input validation on API routes — `src/lib/budget/validation.ts` (bad type/date/category/amount → clean 400)
- [x] Generic 500 responses — no more `e.message` (DB internals) leaking to clients
- [x] Same-site guard on all API routes — shared `requireApiUser()`; cross-site fetch → 403 (was 500), anon → 401
- [x] Security headers via `vercel.json` — nosniff, Referrer-Policy, Permissions-Policy, CSP `frame-ancestors`
- [x] CSV formula/quote injection escaping
- [x] TanStack Start/Router patched for Vercel XSS advisory (`1d62ed0`)
- [x] Audit verified: IDOR isolation, sign-in rate limiting (429), origin checks, parameterized SQL, no secrets in git, preview bridge origin-gated
- [x] QA test-user cleanup in prod (leftover inert accounts noted below)

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
- [ ] Unit tests for store logic — validation + recurring covered (72 tests total); `parseAmount`, `summarizeMonth`, budget reducers still untested
- [ ] Integration tests
- [ ] E2E tests with Playwright — 27-check PowerShell suite + Playwright smoke exist (temp scripts); promote to repo-hosted `*.spec.ts`
- [ ] Performance optimization (routes chunk 747KB > 500KB warning)
- [ ] Bundle analysis
- [ ] SEO improvements
- [ ] PWA manifest (only `favicon.svg` exists — no icons/manifest)
- [ ] Offline support (localStorage persists, but no service worker)

### Housekeeping
- [x] Custom domain — ~~bought `thantsin.website` (Z.com)~~ removed from Vercel (`4f840e6`); app lives at **`shal-su.vercel.app`** — Z.com registration cancellation pending on user side
- [ ] Delete 4 leftover QA test accounts in prod DB (`idor-a/b`, `final/final2 @test.local`) — emails unrecoverable, needs `DATABASE_URL` from Vercel dashboard (env values are redacted to CLI/API)
- [ ] Stop local dev server (port 8080) when not in use

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
8. ~~**Custom domain**~~ done then removed — app is Telegram-only at `shal-su.vercel.app`; cancel the Z.com `thantsin.website` registration when convenient.

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
