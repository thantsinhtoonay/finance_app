# Changelog

All notable changes to Northline Finance will be documented in this file.

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
