import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Lock,
  Moon,
  Palette,
  Pencil,
  Shield,
  Sun,
  Monitor,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore, applyTheme } from "@/lib/settings/store";
import type { Theme } from "@/lib/settings/types";
import { CURRENCIES } from "@/lib/settings/types";
import { currencySymbol } from "@/lib/budget/format";
import { useBudgetStore } from "@/lib/budget/store";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/store";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { authClient } from "@/lib/auth/client";
import { UserGuide } from "@/components/budget/user-guide";

type SettingsView =
  | "main"
  | "account"
  | "theme"
  | "currency"
  | "privacy"
  | "data";

type Props = {
  onBack: () => void;
};

/** Never surface the synthetic `tg-…@shalsu.telegram` address in the UI. */
function accountEmailLabel(primaryEmail: string | null | undefined, fallback: string): string {
  if (primaryEmail && !primaryEmail.endsWith("@shalsu.telegram")) return primaryEmail;
  return fallback;
}

export function Settings({ onBack }: Props) {
  const [view, setView] = useState<SettingsView>("main");
  // Shared avatar preview — lifted so SettingsMain also shows the updated photo
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border/20 bg-background/95 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" onClick={onBack} className="size-10 rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          </motion.div>
          <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      <div className="px-0 pb-4">
        {view === "main" && <SettingsMain onNavigate={setView} localAvatarUrl={localAvatarUrl} />}
        {view === "account" && <AccountSettings onBack={() => setView("main")} onAvatarUploaded={setLocalAvatarUrl} />}
        {view === "theme" && <ThemeSettings onBack={() => setView("main")} />}
        {view === "currency" && <CurrencySettings onBack={() => setView("main")} />}
        {view === "privacy" && <PrivacySettings onBack={() => setView("main")} />}
        {view === "data" && <DataSettings onBack={() => setView("main")} />}
      </div>
    </div>
  );
}

function SettingsMain({
  onNavigate,
  localAvatarUrl,
}: {
  onNavigate: (view: SettingsView) => void;
  localAvatarUrl: string | null;
}) {
  const account = useSettingsStore((s) => s.account);
  const theme = useSettingsStore((s) => s.theme);
  const currency = useSettingsStore((s) => s.currency);
  const privacy = useSettingsStore((s) => s.privacy);
  const user = useCurrentUser();
  const { t } = useTranslation();

  const displayName = user?.displayName || "User";
  const displayEmail = accountEmailLabel(user?.primaryEmail, account.email || "No email");
  const currencyName = CURRENCIES.find((c) => c.code === currency)?.name ?? "Myanmar Kyat";

  const menuItems = [
    {
      icon: User,
      label: t("settings_account"),
      description: `${displayName} · ${displayEmail}`,
      onClick: () => onNavigate("account"),
    },
    {
      icon: Palette,
      label: t("settings_appearance"),
      description: theme === "light" ? t("settings_theme_light") : theme === "dark" ? t("settings_theme_dark") : t("settings_theme_system"),
      onClick: () => onNavigate("theme"),
    },
    {
      icon: Banknote,
      label: t("settings_currency"),
      description: `${currencySymbol(currency)} · ${currencyName}`,
      onClick: () => onNavigate("currency"),
    },
    {
      icon: Shield,
      label: t("settings_privacy"),
      description: privacy.showBalances ? "Balances visible" : "Balances hidden",
      onClick: () => onNavigate("privacy"),
    },
    {
      icon: CreditCard,
      label: t("settings_data"),
      description: "Export or clear your data",
      onClick: () => onNavigate("data"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        {localAvatarUrl || user?.profileImageUrl ? (
          <div className="relative">
            <img
              src={localAvatarUrl || user?.profileImageUrl || ""}
              alt="Profile"
              className="size-16 rounded-2xl object-cover ring-2 ring-primary/30 shadow-lg shadow-primary/10"
            />
            <div className="absolute -bottom-1 -right-1 size-5 rounded-full gradient-gold flex items-center justify-center shadow-md">
              <Check className="size-3 text-white" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src="/images/logo.jpg"
              alt="Shal Su"
              className="size-16 rounded-2xl object-cover ring-2 ring-primary/30 shadow-lg shadow-primary/10"
            />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-sm text-muted-foreground">{displayEmail}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-2">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  "group flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-secondary/50 text-left",
                  i > 0 && "border-t border-border/50",
                )}
              >
                <div className="flex items-center justify-center size-10 rounded-xl glass-toggle text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSettings({ onBack, onAvatarUploaded }: { onBack: () => void; onAvatarUploaded: (url: string) => void }) {
  const user = useCurrentUser();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.displayName || "");
  const [saved, setSaved] = useState(false);
  // Local preview URL — shown immediately after upload
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  // Track the effective display image (local takes priority over session)
  const displayImage = localAvatarUrl || user?.profileImageUrl || null;

  async function handleUpdateName() {
    if (!name.trim()) return;
    try {
      await authClient.updateUser({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Update name failed:", err);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      // Show immediately via local state
      setLocalAvatarUrl(base64);
      onAvatarUploaded(base64);
      try {
        await authClient.updateUser({ image: base64 });
        // Refetch session so it persists across page reloads
        await authClient.getSession();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Update avatar failed:", err);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">{t("settings_account")}</h2>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {displayImage ? (
            <img
              src={displayImage}
              alt="Profile"
              className="size-20 rounded-2xl object-cover ring-2 ring-primary/20"
            />
          ) : (
            <img
              src="/images/logo.jpg"
              alt="Shal Su"
              className="size-20 rounded-2xl object-cover ring-2 ring-primary/20"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Camera className="size-6 text-white" />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <div className="text-center">
          <p className="font-semibold text-lg">{user?.displayName || "User"}</p>
          <p className="text-sm text-muted-foreground">{accountEmailLabel(user?.primaryEmail, "Telegram")}</p>
        </div>
      </div>

      {/* Edit Name */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
              <User className="size-4 text-primary" />
            </div>
            <Label className="text-sm font-semibold flex-1">Display Name</Label>
          </div>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-10"
            />
            <Button
              size="sm"
              onClick={handleUpdateName}
              disabled={!name.trim() || name === user?.displayName}
              className="px-4"
            >
              {saved ? <Check className="size-4" /> : <Pencil className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Guide */}
      <UserGuide />

    </div>
  );
}

function ThemeSettings({ onBack }: { onBack: () => void }) {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const themes: { id: Theme; label: string; icon: typeof Sun; description: string }[] = [
    { id: "light", label: "Light", icon: Sun, description: "Bright and clean" },
    { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
    { id: "system", label: "System", icon: Monitor, description: "Match your device" },
  ];

  function handleThemeChange(newTheme: Theme) {
    setTheme(newTheme);
    applyTheme(newTheme);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">Appearance</h2>
      </div>

      <Card>
        <CardContent className="p-2">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all duration-200 text-left",
                  isActive
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary/50",
                )}
              >
                <div className={cn(
                  "flex items-center justify-center size-10 rounded-xl transition-all duration-300",
                  isActive ? "gradient-gold text-white shadow-md shadow-primary/25" : "glass-toggle text-muted-foreground",
                )}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {isActive && (
                  <div className="flex items-center justify-center size-6 rounded-full gradient-gold text-white animate-scale-in shadow-md shadow-primary/30">
                    <Check className="size-4" />
                  </div>
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="rounded-xl glass-toggle px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Theme is saved locally and persists across sessions.
        </p>
      </div>
    </div>
  );
}

function CurrencySettings({ onBack }: { onBack: () => void }) {
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">{t("settings_currency")}</h2>
      </div>

      <Card>
        <CardContent className="p-2">
          {CURRENCIES.map((opt) => {
            const isActive = currency === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => setCurrency(opt.code)}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all duration-200 text-left",
                  isActive
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary/50",
                )}
              >
                <div className={cn(
                  "flex items-center justify-center size-10 rounded-xl transition-all duration-300 min-w-0",
                  isActive ? "gradient-gold text-white shadow-md shadow-primary/25" : "glass-toggle text-muted-foreground",
                )}>
                  <span className="text-sm font-bold truncate">{currencySymbol(opt.code)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{opt.name}</p>
                  <p className="text-xs text-muted-foreground">{opt.code}</p>
                </div>
                {isActive && (
                  <div className="flex items-center justify-center size-6 rounded-full gradient-gold text-white animate-scale-in shadow-md shadow-primary/30">
                    <Check className="size-4" />
                  </div>
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="rounded-xl glass-toggle px-4 py-3">
        <p className="text-xs text-muted-foreground">
          The symbol is shown across the app — amounts are never converted. Saved on this device.
        </p>
      </div>
    </div>
  );
}

function PrivacySettings({ onBack }: { onBack: () => void }) {
  const privacy = useSettingsStore((s) => s.privacy);
  const setPrivacy = useSettingsStore((s) => s.setPrivacy);

  const toggles = [
    {
      key: "showBalances" as const,
      label: "Show Balances",
      description: "Display balance amounts on dashboard",
      icon: Eye,
    },
    {
      key: "showTransactions" as const,
      label: "Show Transactions",
      description: "Display transaction list",
      icon: CreditCard,
    },
    {
      key: "hideAmountsInCharts" as const,
      label: "Hide Amounts in Charts",
      description: "Show percentages only in charts",
      icon: EyeOff,
    },
    {
      key: "maskSensitiveData" as const,
      label: "Mask Sensitive Data",
      description: "Blur amounts by default",
      icon: Lock,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">Privacy</h2>
      </div>

      <Card>
        <CardContent className="p-2">
          {toggles.map((t, i) => {
            const Icon = t.icon;
            const isEnabled = privacy[t.key];
            return (
              <div
                key={t.key}
                role="button"
                tabIndex={0}
                onClick={() => setPrivacy({ [t.key]: !isEnabled })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPrivacy({ [t.key]: !isEnabled });
                  }
                }}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-secondary/50 text-left cursor-pointer",
                  i > 0 && "border-t border-border/50",
                )}
              >
                <div className={cn(
                  "flex items-center justify-center size-10 rounded-xl transition-all duration-300",
                  isEnabled ? "bg-primary/15 text-primary" : "glass-toggle text-muted-foreground",
                )}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => setPrivacy({ [t.key]: checked })}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function DataSettings({ onBack }: { onBack: () => void }) {
  const transactions = useBudgetStore((s) => s.transactions);
  const categoryBudgets = useBudgetStore((s) => s.categoryBudgets);
  const resetData = useBudgetStore((s) => s.resetData);
  const [sendState, setSendState] = useState<
    "idle" | "sending" | "sent" | "nolink" | "error"
  >("idle");

  async function sendExport(kind: "csv-all" | "backup-json") {
    setSendState("sending");
    try {
      const res = await fetch("/api/export/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (res.ok) {
        setSendState("sent");
        window.setTimeout(
          () => setSendState((s) => (s === "sent" ? "idle" : s)),
          3000,
        );
      } else if (res.status === 409) {
        setSendState("nolink");
      } else {
        setSendState("error");
      }
    } catch {
      setSendState("error");
    }
  }

  function handleClearData() {
    if (
      confirm(
        "Delete ALL data — transactions, category budgets, and savings goal? This cannot be undone.",
      )
    ) {
      resetData();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">Data & Export</h2>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-label">Export to Telegram</p>

          <button
            onClick={() => sendExport("backup-json")}
            disabled={sendState === "sending"}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left disabled:opacity-60"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
              <Download className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Send JSON backup</p>
              <p className="text-xs text-muted-foreground">Full backup with settings</p>
            </div>
            {sendState === "sent" && <Check className="size-4 text-emerald-500" />}
          </button>

          <button
            onClick={() => sendExport("csv-all")}
            disabled={sendState === "sending"}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left disabled:opacity-60"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10">
              <Download className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Send CSV export</p>
              <p className="text-xs text-muted-foreground">All transactions, spreadsheet-ready</p>
            </div>
          </button>

          {sendState === "sending" && (
            <p className="text-xs text-muted-foreground">Sending to Telegram...</p>
          )}
          {sendState === "sent" && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Sent to Telegram.</p>
          )}
          {sendState === "nolink" && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Link Telegram in Settings first.
            </p>
          )}
          {sendState === "error" && (
            <p className="text-xs text-destructive">Couldn't send to Telegram. Try again.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-label">Danger Zone</p>

          <button
            onClick={handleClearData}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-left"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-destructive/10">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">Clear All Data</p>
              <p className="text-xs text-muted-foreground">Delete all transactions and reset settings</p>
            </div>
          </button>
        </CardContent>
      </Card>

      <div className="rounded-xl glass-toggle px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {transactions.length} transactions · {categoryBudgets.length} category budgets
        </p>
      </div>
    </div>
  );
}
