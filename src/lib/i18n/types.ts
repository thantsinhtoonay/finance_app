export type Language = "en" | "my";

export interface LanguageConfig {
  id: Language;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  typography: TypographyConfig;
}

export interface TypographyConfig {
  fontFamily: string;
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface TranslationKeys {
  // Common
  app_name: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  close: string;
  confirm: string;
  loading: string;
  error: string;
  success: string;
  
  // Navigation
  nav_home: string;
  nav_yearly: string;
  nav_settings: string;
  
  // Dashboard
  dashboard_remaining: string;
  dashboard_income: string;
  dashboard_expenses: string;
  dashboard_savings: string;
  dashboard_budget: string;
  
  // Transactions
  transaction_add: string;
  transaction_edit: string;
  transaction_delete: string;
  transaction_income: string;
  transaction_expense: string;
  transaction_amount: string;
  transaction_category: string;
  transaction_note: string;
  transaction_date: string;
  transaction_recurring: string;
  transaction_search: string;
  
  // Categories
  category_food: string;
  category_transport: string;
  category_housing: string;
  category_utilities: string;
  category_entertainment: string;
  category_shopping: string;
  category_health: string;
  category_education: string;
  category_salary: string;
  category_freelance: string;
  category_investment: string;
  category_other: string;
  
  // Budget
  budget_limit: string;
  budget_spent: string;
  budget_remaining: string;
  budget_warning: string;
  budget_exceeded: string;
  
  // Savings
  savings_goal: string;
  savings_target: string;
  savings_deadline: string;
  savings_progress: string;
  savings_days_left: string;
  
  // Settings
  settings_account: string;
  settings_appearance: string;
  settings_privacy: string;
  settings_data: string;
  settings_language: string;
  settings_theme: string;
  settings_theme_light: string;
  settings_theme_dark: string;
  settings_theme_system: string;
  
  // Privacy
  privacy_show_balances: string;
  privacy_show_transactions: string;
  privacy_hide_amounts: string;
  privacy_mask_data: string;
  
  // Data
  data_export_json: string;
  data_export_csv: string;
  data_import: string;
  data_clear: string;
  data_clear_confirm: string;
  
  // Time
  time_monthly: string;
  time_yearly: string;
  time_weekly: string;
  time_biweekly: string;
  
  // Messages
  msg_no_transactions: string;
  msg_no_budgets: string;
  msg_no_savings: string;
  msg_confirm_delete: string;
  msg_data_cleared: string;
  msg_import_success: string;
  msg_import_error: string;
}
