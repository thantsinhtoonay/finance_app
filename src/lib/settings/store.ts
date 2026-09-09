import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, AccountSettings, PrivacySettings, Theme } from "./types";
import { DEFAULT_SETTINGS } from "./types";

type SettingsState = AppSettings & {
  setTheme: (theme: Theme) => void;
  setAccount: (account: Partial<AccountSettings>) => void;
  setPrivacy: (privacy: Partial<PrivacySettings>) => void;
  resetSettings: () => void;
  getDisplayName: () => string;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) =>
        set({ theme, updatedAt: new Date().toISOString() }),

      setAccount: (account) =>
        set((s) => ({
          account: { ...s.account, ...account },
          updatedAt: new Date().toISOString(),
        })),

      setPrivacy: (privacy) =>
        set((s) => ({
          privacy: { ...s.privacy, ...privacy },
          updatedAt: new Date().toISOString(),
        })),

      resetSettings: () => {
        localStorage.removeItem("northline-settings");
        set({ ...DEFAULT_SETTINGS, updatedAt: new Date().toISOString() });
      },

      getDisplayName: () => {
        const state = get();
        if (state.account.name && state.account.name !== "User") {
          return state.account.name;
        }
        if (state.account.email) {
          return state.account.email.split("@")[0];
        }
        return "User";
      },
    }),
    {
      name: "northline-settings",
    },
  ),
);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(systemDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

export function initTheme() {
  const stored = localStorage.getItem("northline-settings");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const theme = parsed?.state?.theme || "system";
      applyTheme(theme);
    } catch {
      applyTheme("system");
    }
  } else {
    applyTheme("system");
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const stored = localStorage.getItem("northline-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const theme = parsed?.state?.theme || "system";
        if (theme === "system") applyTheme("system");
      } catch {
        applyTheme("system");
      }
    }
  });
}
