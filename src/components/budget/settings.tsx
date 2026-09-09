import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Camera,
  Check,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Globe,
  Lock,
  LogOut,
  Moon,
  Palette,
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
import { useSettingsStore, applyTheme } from "@/lib/settings/store";
import type { Theme } from "@/lib/settings/types";
import { useBudgetStore } from "@/lib/budget/store";
import { cn } from "@/lib/utils";

type SettingsView = "main" | "account" | "theme" | "privacy" | "data";

type Props = {
  onBack: () => void;
};

export function Settings({ onBack }: Props) {
  const [view, setView] = useState<SettingsView>("main");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        {view === "main" && <SettingsMain onNavigate={setView} onBack={onBack} />}
        {view === "account" && <AccountSettings onBack={() => setView("main")} />}
        {view === "theme" && <ThemeSettings onBack={() => setView("main")} />}
        {view === "privacy" && <PrivacySettings onBack={() => setView("main")} />}
        {view === "data" && <DataSettings onBack={() => setView("main")} />}
      </div>
    </div>
  );
}

function SettingsMain({
  onNavigate,
  onBack,
}: {
  onNavigate: (view: SettingsView) => void;
  onBack: () => void;
}) {
  const account = useSettingsStore((s) => s.account);
  const theme = useSettingsStore((s) => s.theme);
  const privacy = useSettingsStore((s) => s.privacy);
  const getDisplayName = useSettingsStore((s) => s.getDisplayName);

  const menuItems = [
    {
      icon: User,
      label: "Account",
      description: `${getDisplayName()} · ${account.email || "No email"}`,
      onClick: () => onNavigate("account"),
    },
    {
      icon: Palette,
      label: "Appearance",
      description: theme === "light" ? "Light mode" : theme === "dark" ? "Dark mode" : "System default",
      onClick: () => onNavigate("theme"),
    },
    {
      icon: Shield,
      label: "Privacy",
      description: privacy.showBalances ? "Balances visible" : "Balances hidden",
      onClick: () => onNavigate("privacy"),
    },
    {
      icon: CreditCard,
      label: "Data & Export",
      description: "Export or clear your data",
      onClick: () => onNavigate("data"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center justify-center size-16 rounded-2xl gradient-purple text-white text-2xl font-bold">
          {getDisplayName().charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold">{getDisplayName()}</h2>
          <p className="text-sm text-muted-foreground">{account.email || "No email set"}</p>
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
                  "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors hover:bg-secondary/50 text-left",
                  i > 0 && "border-t border-border/50",
                )}
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSettings({ onBack }: { onBack: () => void }) {
  const account = useSettingsStore((s) => s.account);
  const setAccount = useSettingsStore((s) => s.setAccount);
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setAccount({ name: name.trim() || "User", email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">Account</h2>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="relative group">
          <div className="flex items-center justify-center size-20 rounded-2xl gradient-purple text-white text-3xl font-bold">
            {name.charAt(0).toUpperCase() || "U"}
          </div>
          <button className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="size-6 text-white" />
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold">Currency</Label>
            <div className="flex items-center h-11 px-4 rounded-xl bg-secondary/50 text-sm font-medium">
              USD ($)
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="gradient-purple text-white shadow-lg shadow-primary/25">
        {saved ? (
          <>
            <Check className="size-4" />
            Saved!
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
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
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
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
                  "flex items-center justify-center size-10 rounded-xl",
                  isActive ? "bg-primary text-white" : "bg-secondary",
                )}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {isActive && (
                  <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white">
                    <Check className="size-4" />
                  </div>
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="rounded-xl bg-secondary/30 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Theme is saved locally and persists across sessions.
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
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
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
              <button
                key={t.key}
                onClick={() => setPrivacy({ [t.key]: !isEnabled })}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors hover:bg-secondary/50 text-left",
                  i > 0 && "border-t border-border/50",
                )}
              >
                <div className="flex items-center justify-center size-10 rounded-xl bg-secondary">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <div
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors duration-200",
                    isEnabled ? "bg-primary" : "bg-secondary",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200",
                      isEnabled ? "translate-x-[22px]" : "translate-x-0.5",
                    )}
                  />
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function DataSettings({ onBack }: { onBack: () => void }) {
  const transactions = useBudgetStore((s) => s.transactions);
  const monthlyGoal = useBudgetStore((s) => s.monthlyGoal);
  const categoryBudgets = useBudgetStore((s) => s.categoryBudgets);
  const resetData = useBudgetStore((s) => s.resetData);
  const [exported, setExported] = useState(false);

  function handleExportJson() {
    const data = {
      version: 1,
      transactions,
      monthlyGoal,
      categoryBudgets,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `northline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  function handleExportCsv() {
    const header = "Date,Type,Category,Amount,Note,Recurring";
    const rows = transactions
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((t) => {
        const note = t.note.replace(/"/g, '""');
        return `${t.date},${t.type},"${t.category}",${t.amount},"${note}",${t.recurring || ""}`;
      });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `northline-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClearData() {
    if (confirm("Delete ALL transaction history? This cannot be undone.")) {
      resetData();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">Data & Export</h2>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-label">Export</p>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
              <Download className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Export as JSON</p>
              <p className="text-xs text-muted-foreground">Full backup with settings</p>
            </div>
            {exported && <Check className="size-4 text-emerald-500" />}
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-50">
              <Download className="size-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Export as CSV</p>
              <p className="text-xs text-muted-foreground">Spreadsheet-compatible format</p>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-label">Danger Zone</p>

          <button
            onClick={handleClearData}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-red-100">
              <Trash2 className="size-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Clear All Data</p>
              <p className="text-xs text-muted-foreground">Delete all transactions and reset settings</p>
            </div>
          </button>
        </CardContent>
      </Card>

      <div className="rounded-xl bg-secondary/30 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {transactions.length} transactions · {categoryBudgets.length} category budgets
        </p>
      </div>
    </div>
  );
}
