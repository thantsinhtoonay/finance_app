import { TranslationKeys } from "../types";

export const en: TranslationKeys = {
  // Common
  app_name: "Shal Su",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  add: "Add",
  close: "Close",
  confirm: "Confirm",
  loading: "Loading...",
  error: "Error",
  success: "Success",
  
  // Auth
  auth_signin_subtitle: "Sign in to your account",
  auth_register_subtitle: "Create your account",
  auth_full_name: "Full Name",
  auth_email: "Email",
  auth_password: "Password",
  auth_confirm_password: "Confirm Password",
  auth_signin: "Sign In",
  auth_signing_in: "Signing in...",
  auth_signup: "Sign Up",
  auth_create_account: "Create Account",
  auth_creating_account: "Creating account...",
  auth_no_account: "Don't have an account?",
  auth_have_account: "Already have an account?",
  auth_error_invalid: "Invalid email or password",
  auth_error_mismatch: "Passwords do not match",
  auth_error_min_length: "Password must be at least 6 characters",
  auth_error_unexpected: "An unexpected error occurred",
  auth_error_register: "Registration failed",
  auth_telegram_continue: "Continue with Telegram",
  auth_telegram_open: "Open Telegram",
  auth_telegram_waiting: "Waiting for you in Telegram...",
  auth_telegram_hint: "Tap Start in the bot chat and you'll be signed in automatically.",
  auth_telegram_or: "or",
  auth_telegram_expired: "That sign-in link expired. Please try again.",
  auth_telegram_conflict: "This Telegram account is linked to a different account.",
  auth_telegram_throttled: "Too many attempts. Wait a minute and try again.",
  auth_telegram_unavailable: "Telegram sign-in isn't available right now.",
  landing_subtitle: "Your personal finance companion",
  landing_hint:
    "Shal Su works inside Telegram. Open the bot to sign in — your account is created automatically the first time.",
  landing_open_telegram: "Open in Telegram",
  landing_auth_error: "Couldn't sign you in automatically. Try opening the bot again.",

  // Navigation
  nav_home: "Home",
  nav_history: "History",
  nav_yearly: "Yearly",
  nav_settings: "Settings",
  
  // History
  history_title: "History",
  history_subtitle: "Review past months",
  history_this_month: "This month",
  list_transactions: "Transactions",
  stat_remaining: "Remaining",
  
  // Dashboard
  dashboard_remaining: "Remaining this month",
  dashboard_income: "Income",
  dashboard_expenses: "Expenses",
  dashboard_savings: "Savings",
  dashboard_budget: "Budget",
  
  // Transactions
  transaction_add: "Add Transaction",
  transaction_edit: "Edit Transaction",
  transaction_delete: "Delete Transaction",
  transaction_income: "Income",
  transaction_expense: "Expense",
  transaction_amount: "Amount",
  transaction_category: "All",
  transaction_note: "Note",
  transaction_date: "Date",
  transaction_recurring: "Recurring",
  transaction_search: "Search transactions...",
  
  // Categories
  category_food: "Food & Drinks",
  category_grocery: "Groceries",
  category_transport: "Transport",
  category_housing: "Housing",
  category_utilities: "Utilities",
  category_entertainment: "Entertainment",
  category_shopping: "Shopping",
  category_health: "Health",
  category_education: "Education",
  category_personal: "Personal Care",
  category_subscription: "Subscriptions",
  category_travel: "Travel",
  category_fitness: "Fitness & Sports",
  category_gift: "Gifts & Donations",
  category_insurance: "Insurance",
  category_fees: "Bank Fees",
  category_salary: "Salary",
  category_freelance: "Freelance",
  category_business: "Business",
  category_investment: "Investment",
  category_rental: "Rental Income",
  category_bonus: "Bonus",
  category_refund: "Refunds & Cashback",
  category_gift_income: "Gifts Received",
  category_other: "Other",
  
  // Budget
  budget_limit: "Budget Limit",
  budget_spent: "Spent",
  budget_remaining: "Remaining",
  budget_warning: "Approaching limit",
  budget_exceeded: "Budget exceeded",
  budget_set: "Set budget",
  budget_remove: "Remove budget",

  // User guide
  guide_title: "User Guide",
  guide_subtitle: "How to get started with Shal Su",
  guide_step1_title: "Create your account",
  guide_step1_desc:
    "Sign up with your email and password — your data stays safe in your own account.",
  guide_step2_title: "Record income & expenses",
  guide_step2_desc:
    "Tap the + button, pick a category, then enter the amount and date.",
  guide_step3_title: "Set monthly budgets",
  guide_step3_desc:
    "Set a spending limit for each category and watch the progress bar.",
  guide_step4_title: "Set a savings goal",
  guide_step4_desc:
    "Choose a target amount and deadline to stay motivated.",
  guide_step5_title: "Review history & yearly",
  guide_step5_desc:
    "Browse past months and see your full-year spending at a glance.",
  guide_step6_title: "Personalize your settings",
  guide_step6_desc:
    "Switch theme and language, hide amounts, and export JSON/CSV backups.",
  
  // Savings
  savings_goal: "Savings Goal",
  savings_target: "Target Amount",
  savings_deadline: "Deadline",
  savings_progress: "Progress",
  savings_days_left: "to go",
  
  // Settings
  settings_account: "Account",
  settings_appearance: "Appearance",
  settings_currency: "Currency",
  settings_privacy: "Privacy",
  settings_data: "Data & Export",
  settings_telegram: "Telegram",
  settings_telegram_desc: "Sign-in, exports and summaries",
  settings_telegram_not_linked: "Not linked",
  settings_telegram_link_desc:
    "Link your Telegram account to sign in with it and receive exports and monthly summaries in this chat.",
  settings_telegram_unlink: "Unlink Telegram",
  settings_telegram_unlinked: "Telegram unlinked.",
  settings_telegram_unavailable: "The Telegram bot isn't configured on this server.",
  settings_language: "Language",
  settings_theme: "Theme",
  settings_theme_light: "Light",
  settings_theme_dark: "Dark",
  settings_theme_system: "System",
  
  // Privacy
  privacy_show_balances: "Show Balances",
  privacy_show_transactions: "Show Transactions",
  privacy_hide_amounts: "Hide Amounts in Charts",
  privacy_mask_data: "Mask Sensitive Data",
  
  // Data
  data_export_json: "Export JSON Backup",
  data_export_csv: "Export CSV",
  data_import: "Import Data",
  data_clear: "Clear All Data",
  data_clear_confirm: "Are you sure? This will permanently delete all your data.",
  
  // Time
  time_monthly: "Monthly",
  time_yearly: "Yearly",
  time_weekly: "Weekly",
  time_biweekly: "Bi-weekly",
  
  // Messages
  msg_no_transactions: "No transactions yet",
  msg_no_budgets: "No budgets set",
  msg_no_savings: "No savings goals",
  msg_confirm_delete: "Are you sure you want to delete this?",
  msg_data_cleared: "All data has been cleared",
  msg_import_success: "Data imported successfully",
  msg_import_error: "Error importing data",

  // Dialog
  dialog_add_entry: "Add entry",
  dialog_edit_entry: "Edit entry",
  dialog_add_desc: "Log income or an expense for your budget.",
  dialog_edit_desc: "Update this income or expense.",
  dialog_amount: "Amount",
  dialog_category: "Category",
  dialog_date: "Date",
  dialog_recurring: "Recurring",
  dialog_one_time: "One-time",
  dialog_note: "Note",
  dialog_optional: "Optional",
  dialog_remaining_after: "Remaining after this:",
  dialog_save_changes: "Save changes",
  dialog_error_zero_amount: "Enter an amount greater than zero.",
  dialog_error_no_date: "Choose a date.",
  dialog_error_income_first: "Add income first — expenses are locked until you record your first income.",

  // Recurring
  recurring_weekly: "Weekly",
  recurring_biweekly: "Bi-weekly",
  recurring_monthly: "Monthly",
  recurring_yearly: "Yearly",
};
