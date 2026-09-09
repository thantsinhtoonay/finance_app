export type Theme = "light" | "dark" | "system";

export type AccountSettings = {
  name: string;
  email: string;
  currency: string;
  avatarUrl: string | null;
};

export type PrivacySettings = {
  showBalances: boolean;
  showTransactions: boolean;
  hideAmountsInCharts: boolean;
  maskSensitiveData: boolean;
};

export type AppSettings = {
  version: 1;
  theme: Theme;
  account: AccountSettings;
  privacy: PrivacySettings;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_ACCOUNT: AccountSettings = {
  name: "User",
  email: "",
  currency: "USD",
  avatarUrl: null,
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  showBalances: true,
  showTransactions: true,
  hideAmountsInCharts: false,
  maskSensitiveData: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  theme: "system",
  account: DEFAULT_ACCOUNT,
  privacy: DEFAULT_PRIVACY,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
