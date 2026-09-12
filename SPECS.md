# Specifications

## Overview

**Northline Finance** is a client-side personal finance tracking application. All data is stored in the browser's localStorage with no server-side persistence or authentication.

## Functional Requirements

### FR-001: Transaction Management
- **FR-001.1:** Users can add income or expense transactions with amount, category, note, and date
- **FR-001.2:** Users can edit existing transactions
- **FR-001.3:** Users can delete transactions with confirmation
- **FR-001.4:** Transactions are grouped by month (YYYY-MM format)
- **FR-001.5:** Transaction amounts use Myanmar Kyat (MMK) with no decimals

### FR-002: Category System
- **FR-002.1:** Predefined categories for income and expenses
- **FR-002.2:** Each category has an icon and color
- **FR-002.3:** Categories: Food & Drinks, Transport, Housing, Utilities, Entertainment, Shopping, Health, Education, Salary, Freelance, Investment, Other

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

### FR-006: Search and Filter
- **FR-006.1:** Real-time search by transaction note
- **FR-006.2:** Filter by category
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
- **FR-009.1:** Account settings (name, email, avatar initial)
- **FR-009.2:** Theme toggle (Light, Dark, System)
- **FR-009.3:** Privacy controls (hide balances, transactions, mask amounts)
- **FR-009.4:** Data management (export, import, clear)

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
- All data stored in localStorage
- No server-side storage
- Data survives page refresh
- Data persists across browser sessions (until cleared)

### NFR-006: Security
- No sensitive data collection
- No external API calls for data
- No authentication required
- XSS prevention via React's default escaping

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

### Color Palette
- Primary: `#7c3aed` (Purple)
- Background: `#f8f7ff` (Light) / `#0f0a1a` (Dark)
- Card: `#ffffff` (Light) / `#1a1230` (Dark)
- Income: `#10b981` (Green)
- Expense: `#ef4444` (Red)
- Text: `#1a1625` (Light) / `#f0eeff` (Dark)

### Typography
- Font: Inter
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

None — This is a client-side application with no server API.

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
