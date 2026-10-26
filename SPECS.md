# Specifications

## Overview

**Shal Su** (internal codename "Northline Finance") is a full-stack personal finance tracking application. Data is persisted server-side in Neon Postgres behind an authenticated API (Better Auth email/password), with a localStorage cache for offline resilience. The UI is bilingual (English / Burmese).

## Functional Requirements

### FR-001: Transaction Management
- **FR-001.1:** Users can add income or expense transactions with amount, category, note, and date
- **FR-001.2:** Users can edit existing transactions
- **FR-001.3:** Users can delete transactions with confirmation
- **FR-001.4:** Transactions are grouped by month (YYYY-MM format)
- **FR-001.5:** Transaction amounts use Myanmar Kyat (MMK) with no decimals

### FR-002: Category System
- **FR-002.1:** Predefined categories for income and expenses (17 expense / 9 income, bilingual labels)
- **FR-002.2:** Each category has a colored dot indicator
- **FR-002.3:** Categories include Food & Drinks, Transport, Housing, Utilities, Entertainment, Shopping, Health, Education, Salary, Freelance, Investment, and more (see `src/lib/budget/categories.ts`)

### FR-003: Budget Tracking
- **FR-003.1:** Users can set monthly spending limits per category
- **FR-003.2:** Visual warnings when approaching (80%) or exceeding limits
- **FR-003.3:** Progress bars show spent vs. limit
- **FR-003.4:** Budget data persists across sessions

### FR-004: Savings Goals
- **FR-004.1:** Users can create savings goals with name, target amount, and deadline
- **FR-004.2:** Visual progress tracking with percentage complete
- **FR-004.3:** Days until deadline displayed
- **FR-004.4:** Goals are independent of monthly budgets

### FR-005: Recurring Transactions
- **FR-005.1:** Transactions can be marked as recurring
- **FR-005.2:** Frequencies: Weekly, Bi-weekly, Monthly, Yearly
- **FR-005.3:** Auto-generation of recurring transactions on month change
- **FR-005.4:** Recurring transactions create new entries, not modify existing

### FR-006: Search and History
- **FR-006.1:** History view lists a selected month's transactions
- **FR-006.2:** Real-time search by note or category name
- **FR-006.3:** Search results update instantly
- **FR-006.4:** Clear search with Escape key

### FR-007: Data Visualization
- **FR-007.1:** Pie chart for category breakdown
- **FR-007.2:** Bar chart for yearly income/expense comparison
- **FR-007.3:** Progress bars for budgets and savings
- **FR-007.4:** Charts use accessible colors with sufficient contrast

### FR-008: Data Export/Import
- **FR-008.1:** Export transactions to CSV format
- **FR-008.2:** Export full data (transactions, budgets, goals) to JSON
- **FR-008.3:** Import data from JSON backup
- **FR-008.4:** Clear all data with confirmation dialog

### FR-009: Settings
- **FR-009.1:** Account settings (name, email change, avatar initial, change password)
- **FR-009.2:** Theme toggle (Light, Dark, System) + currency selector
- **FR-009.3:** Privacy controls (hide balances, transactions, mask amounts)
- **FR-009.4:** Data management (CSV export, PDF export, JSON backup/import, clear all data)
- **FR-009.5:** Account deletion with confirmation

### FR-010: Authentication
- **FR-010.1:** Email/password sign-up and sign-in (Better Auth)
- **FR-010.2:** Forgot/reset password flow via emailed link
- **FR-010.3:** Session-gated API — unauthenticated requests receive 401
- **FR-010.4:** Origin checks on credentialed auth POSTs; brute-force rate limiting

### FR-011: Internationalization
- **FR-011.1:** Live language switch (English / Burmese) on every page — header, settings, auth pages, user guide
- **FR-011.2:** Localized dates and month names (custom Burmese month arrays)
- **FR-011.3:** Language choice persists across sessions
- **FR-011.4:** Every translated key must exist in both language files (type-enforced)

### FR-012: Receipt Photos
- **FR-012.1:** Attach/replace/remove a receipt image on income & expense entries
- **FR-012.2:** Client-side compression (≤400KB JPEG) before upload
- **FR-012.3:** Images stored server-side; fetched on demand; included in JSON backups

### FR-013: Exports
- **FR-013.1:** CSV export (month or all transactions) with formula-injection escaping
- **FR-013.2:** PDF export (month or all) — branded header, summary, category table
- **FR-013.3:** JSON backup/restore including budgets, goals, and receipts

### FR-014: Income-First Expense Gate
- **FR-014.1:** Expense entry is locked in the UI until the first income is recorded
- **FR-014.2:** Server returns 409 on expense writes (POST/PUT/import/recurring materialization) before any income exists

## Non-Functional Requirements

### NFR-001: Performance
- Initial load < 3 seconds on 3G
- Transaction list renders < 100ms for 500 items
- Chart updates < 50ms
- No layout shift during load

### NFR-002: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader support with ARIA labels
- Focus visible indicators
- Color contrast ratio ≥ 4.5:1

### NFR-003: Responsive Design
- Mobile-first (390px minimum)
- Tablet support (768px)
- Desktop support (1024px+)
- Touch-friendly targets (44px minimum)

### NFR-004: Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### NFR-005: Data Persistence
- Server-side storage in Neon Postgres (session-gated API)
- localStorage cache keeps the app usable offline
- Data survives page refresh and across browser sessions
- JSON backup/restore for portability

### NFR-006: Security
- Authentication required for all data APIs (401 for anonymous)
- Origin checks on credentialed auth POSTs; DB-backed rate limiting
- Security headers via `vercel.json` (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy)
- Strict input validation (Zod) and generic 500 responses
- XSS prevention via React's default escaping; CSV formula-injection escaping

## Data Models

### Transaction
```typescript
{
  id: string;           // UUID
  type: "income" | "expense";
  amount: number;       // Positive integer (MMK)
  category: string;     // Category ID
  note: string;         // User description
  date: string;         // ISO date (YYYY-MM-DD)
  recurring?: "weekly" | "biweekly" | "monthly" | "yearly";
  receiptImage?: string; // Compressed JPEG data URL (optional)
}
```

### CategoryBudget
```typescript
{
  category: string;     // Category ID
  limit: number;        // Monthly limit (MMK)
  spent: number;        // Current month spending
}
```

### SavingsGoal
```typescript
{
  id: string;           // UUID
  name: string;         // Goal name
  target: number;       // Target amount (MMK)
  deadline: string;     // ISO date
}
```

### AppSettings
```typescript
{
  account: {
    name: string;
    email: string;
    avatar: string;     // Initial letter
  };
  theme: "light" | "dark" | "system";
  privacy: {
    showBalances: boolean;
    showTransactions: boolean;
    hideAmountsInCharts: boolean;
    maskSensitiveData: boolean;
  };
  data: {
    autoBackup: boolean;
    lastBackup?: string;
  };
}
```

## UI Specifications

### Layout
- Fixed header with month navigation and actions
- Scrollable content area
- Fixed bottom navigation on mobile
- Floating action button for quick add

### Color Palette (Shal Su — gold/brown)
- Primary: `#b8860b` light / `#d4a843` dark (darkgoldenrod)
- Background: `#fff9f0` (Light) / `#1a0f05` (Dark)
- Card: `#fffcf7` (Light) / `#2a1a0a` (Dark)
- Income: `#2e7d32` (Light) / `#66bb6a` (Dark)
- Expense: `#c0392b` (Light) / `#e74c3c` (Dark)
- Text: `#3d2512` (Light) / `#f5e6d0` (Dark)

### Typography
- Font: Inter (English), Padauk (Burmese)
- Display: 2rem, 700 weight
- Body: 1rem, 400 weight
- Label: 0.75rem, 600 weight, uppercase

### Spacing
- Card padding: 1.25rem
- Section gap: 1.25rem
- Component gap: 0.75rem
- Border radius: 1rem (cards), 0.75rem (buttons)

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `N` | Open add transaction dialog | Global |
| `/` | Focus search input | Global |
| `?` | Toggle keyboard shortcuts help | Global |
| `Esc` | Close dialog / clear search | Global |
| `Enter` | Confirm dialog action | Dialog |
| `Tab` | Navigate between elements | Global |
| `Arrow keys` | Navigate within lists | Lists |

## API Endpoints

All under `/api`, session-gated (401 anonymous), JSON in/out:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/auth/*` | various | Better Auth handler (sign-up, sign-in, reset, session) |
| `/api/transactions` | GET, POST | List month transactions / create |
| `/api/transactions/:id` | PUT, DELETE | Update / remove an entry |
| `/api/budgets` | GET, POST | Category budgets |
| `/api/settings` | GET, POST | Account/settings sync |

## Error Handling

- **Transaction validation:** Amount must be positive, category required
- **Date validation:** Must be valid ISO date format
- **Storage quota:** Alert user if localStorage is full
- **Import validation:** Validate JSON structure before importing

## Testing Strategy

- **Unit tests:** Store logic, formatting functions
- **Component tests:** UI component rendering
- **Integration tests:** User workflows
- **E2E tests:** Critical paths (add transaction, export data)
- **Accessibility tests:** Screen reader, keyboard navigation
