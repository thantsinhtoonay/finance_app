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
  auth_forgot_password: string;
  forgot_title: string;
  forgot_desc: string;
  forgot_submit: string;
  forgot_sending: string;
  forgot_sent: string;
  forgot_back_login: string;
  reset_title: string;
  reset_desc: string;
  reset_submit: string;
  reset_updating: string;
  reset_invalid: string;
  reset_success: string;
  reset_request_new: string;

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
  list_receipt: string;
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
  settings_guide: string;
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
  dialog_error_save_failed: string;
  dialog_receipt: string;
  dialog_receipt_add: string;
  dialog_receipt_replace: string;
  dialog_receipt_remove: string;
  dialog_receipt_view: string;
  dialog_receipt_loading: string;
  receipt_error_type: string;
  receipt_error_large: string;
  receipt_error_decode: string;
  receipt_error_size: string;

  // Recurring
  recurring_weekly: string;
  recurring_biweekly: string;
  recurring_monthly: string;
  recurring_yearly: string;

  // Settings — account
  settings_user: string;
  settings_no_email: string;
  settings_no_email_set: string;
  settings_display_name: string;
  settings_name_placeholder: string;
  settings_balances_visible: string;
  settings_balances_hidden: string;
  settings_data_desc: string;
  settings_guide_desc: string;
  settings_change_password: string;
  settings_change_password_desc: string;
  settings_current_password: string;
  settings_new_password: string;
  settings_confirm_new_password: string;
  settings_update_password: string;
  settings_changing: string;
  settings_password_match: string;
  settings_password_different: string;
  settings_password_changed: string;
  settings_password_change_failed: string;
  settings_change_email: string;
  settings_new_email: string;
  settings_update_email: string;
  settings_updating: string;
  settings_email_required: string;
  settings_email_updated: string;
  settings_email_change_failed: string;
  settings_sign_out: string;
  settings_sign_out_desc: string;
  settings_delete_account: string;
  settings_delete_account_desc: string;
  settings_delete_enter_password: string;
  settings_delete_warn1: string;
  settings_delete_warn2: string;
  settings_delete_confirm_btn: string;
  settings_deleting: string;
  settings_delete_failed: string;
  settings_avatar_size: string;
  settings_avatar_type: string;

  // Settings — appearance & currency
  theme_light_desc: string;
  theme_dark_desc: string;
  theme_system_desc: string;
  theme_note: string;
  currency_note: string;

  // Privacy — descriptions
  privacy_show_balances_desc: string;
  privacy_show_transactions_desc: string;
  privacy_hide_amounts_desc: string;
  privacy_mask_data_desc: string;

  // Data — export section
  data_export_section: string;
  data_export_as_csv: string;
  data_export_csv_desc: string;
  data_export_pdf: string;
  data_export_pdf_desc: string;
  data_danger_zone: string;
  data_clear_desc: string;
  data_clear_confirm_full: string;
  data_stats_transactions: string;
  data_stats_budgets: string;

  // Yearly overview
  yearly_summary: string;
  yearly_desc: string;
  yearly_total_income: string;
  yearly_total_expenses: string;
  yearly_net_savings: string;
  yearly_breakdown: string;
  yearly_breakdown_desc: string;
  yearly_top_categories: string;
  yearly_top_desc: string;

  // Accessibility & misc
  aria_prev_month: string;
  aria_next_month: string;
  register_name_placeholder: string;
  error_backup_format: string;
  error_backup_parse: string;

  // Guide chrome
  guide_badge: string;
  guide_section: string;
  guide_open_app: string;
  guide_signin_page: string;
  guide_back_top: string;

  // Import / shortcuts
  error_backup_skipped: string;
  confirm_import: string;
  msg_remove_confirm: string;
  shortcuts_title: string;
  list_actions: string;
  aria_progress_percent: string;
}
