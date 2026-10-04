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
  
  // Auth
  auth_signin_subtitle: string;
  auth_register_subtitle: string;
  auth_full_name: string;
  auth_email: string;
  auth_password: string;
  auth_confirm_password: string;
  auth_signin: string;
  auth_signing_in: string;
  auth_signup: string;
  auth_create_account: string;
  auth_creating_account: string;
  auth_no_account: string;
  auth_have_account: string;
  auth_error_invalid: string;
  auth_error_mismatch: string;
  auth_error_min_length: string;
  auth_error_unexpected: string;
  auth_error_register: string;

  // Navigation
  nav_home: string;
  nav_history: string;
  nav_yearly: string;
  nav_settings: string;

  // History
  history_title: string;
  history_subtitle: string;
  history_this_month: string;
  list_transactions: string;
  stat_remaining: string;
  
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
  category_grocery: string;
  category_transport: string;
  category_housing: string;
  category_utilities: string;
  category_entertainment: string;
  category_shopping: string;
  category_health: string;
  category_education: string;
  category_personal: string;
  category_subscription: string;
  category_travel: string;
  category_fitness: string;
  category_gift: string;
  category_insurance: string;
  category_fees: string;
  category_salary: string;
  category_freelance: string;
  category_business: string;
  category_investment: string;
  category_rental: string;
  category_bonus: string;
  category_refund: string;
  category_gift_income: string;
  category_other: string;
  
  // Budget
  budget_limit: string;
  budget_spent: string;
  budget_remaining: string;
  budget_warning: string;
  budget_exceeded: string;
  budget_set: string;
  budget_remove: string;

  // User guide
  guide_title: string;
  guide_subtitle: string;
  guide_step1_title: string;
  guide_step1_desc: string;
  guide_step2_title: string;
  guide_step2_desc: string;
  guide_step3_title: string;
  guide_step3_desc: string;
  guide_step4_title: string;
  guide_step4_desc: string;
  guide_step5_title: string;
  guide_step5_desc: string;
  guide_step6_title: string;
  guide_step6_desc: string;
  
  // Savings
  savings_goal: string;
  savings_target: string;
  savings_deadline: string;
  savings_progress: string;
  savings_days_left: string;
  
  // Settings
  settings_account: string;
  settings_appearance: string;
  settings_currency: string;
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

  // Dialog
  dialog_add_entry: string;
  dialog_edit_entry: string;
  dialog_add_desc: string;
  dialog_edit_desc: string;
  dialog_amount: string;
  dialog_category: string;
  dialog_date: string;
  dialog_recurring: string;
  dialog_one_time: string;
  dialog_note: string;
  dialog_optional: string;
  dialog_remaining_after: string;
  dialog_save_changes: string;
  dialog_error_zero_amount: string;
  dialog_error_no_date: string;
  dialog_error_income_first: string;

  // Recurring
  recurring_weekly: string;
  recurring_biweekly: string;
  recurring_monthly: string;
  recurring_yearly: string;
}
