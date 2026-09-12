import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
  Key,
  Lock,
  LogOut,
  Mail,
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
import { useSettingsStore, applyTheme } from "@/lib/settings/store";
import type { Theme } from "@/lib/settings/types";
import { useBudgetStore } from "@/lib/budget/store";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/lib/i18n/components/language-selector";
import { useTranslation } from "@/lib/i18n/store";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { authClient } from "@/lib/auth/client";

type SettingsView = "main" | "account" | "theme" | "privacy" | "data" | "language";

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
        {view === "language" && <LanguageSettings onBack={() => setView("main")} />}
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
  const user = useCurrentUser();
  const { t, language } = useTranslation();

  const displayName = user?.displayName || "User";
  const displayEmail = user?.primaryEmail || account.email || "No email";

  const menuItems = [
    {
      icon: User,
      label: t("settings_account"),
      description: `${displayName} · ${displayEmail}`,
      onClick: () => onNavigate("account"),
    },
    {
      icon: Globe,
      label: t("settings_language"),
      description: language === "en" ? "English" : "မြန်မာ",
      onClick: () => onNavigate("language"),
    },
    {
      icon: Palette,
      label: t("settings_appearance"),
      description: theme === "light" ? t("settings_theme_light") : theme === "dark" ? t("settings_theme_dark") : t("settings_theme_system"),
      onClick: () => onNavigate("theme"),
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
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="size-16 rounded-2xl object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex items-center justify-center size-16 rounded-2xl gradient-purple text-white text-2xl font-bold">
            {displayName.charAt(0).toUpperCase()}
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
  const user = useCurrentUser();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || "");
  const [saved, setSaved] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Change email state
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
    setPasswordError("");
    setPasswordSuccess("");
    setEmailError("");
    setEmailSuccess("");
    setDeleteError("");
  }

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
      try {
        await authClient.updateUser({ image: base64 });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Update avatar failed:", err);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (error) {
        setPasswordError(error.message || "Failed to change password");
      } else {
        setPasswordSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch {
      setPasswordError("An unexpected error occurred");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!newEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: newEmail.trim(),
      });
      if (error) {
        setEmailError(error.message || "Failed to change email");
      } else {
        setEmailSuccess("Email updated successfully");
        setNewEmail("");
      }
    } catch {
      setEmailError("An unexpected error occurred");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");

    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await authClient.deleteUser({
        password: deletePassword,
      });
      if (error) {
        setDeleteError(error.message || "Failed to delete account");
        setDeleteLoading(false);
      } else {
        navigate({ to: "/login" });
      }
    } catch {
      setDeleteError("An unexpected error occurred");
      setDeleteLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await authClient.signOut();
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  const avatarInitial = (user?.displayName || name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">{t("settings_account")}</h2>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="size-20 rounded-2xl object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex items-center justify-center size-20 rounded-2xl gradient-purple text-white text-3xl font-bold">
              {avatarInitial}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <p className="text-sm text-muted-foreground">{user?.primaryEmail || "No email"}</p>
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
              className="gradient-purple text-white px-4"
            >
              {saved ? <Check className="size-4" /> : <Pencil className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={() => toggleSection("password")}
            className="flex items-center gap-3 w-full px-5 py-4 text-left"
          >
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
              <Key className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your password regularly</p>
            </div>
            <span className={cn("text-muted-foreground transition-transform", expandedSection === "password" && "rotate-90")}>›</span>
          </button>
          {expandedSection === "password" && (
            <form onSubmit={handleChangePassword} className="px-5 pb-5 flex flex-col gap-3 border-t border-border/50">
              {passwordError && (
                <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mt-3 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-600">
                  {passwordSuccess}
                </div>
              )}
              <div className="flex flex-col gap-2 mt-3">
                <Label className="text-xs font-medium text-muted-foreground">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 pl-8 pr-9 text-sm"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrentPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 pl-8 pr-9 text-sm"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 pl-8 text-sm"
                  />
                </div>
              </div>
              <Button type="submit" disabled={passwordLoading} className="gradient-purple text-white mt-1">
                {passwordLoading ? "Changing..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={() => toggleSection("email")}
            className="flex items-center gap-3 w-full px-5 py-4 text-left"
          >
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
              <Mail className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Change Email</p>
              <p className="text-xs text-muted-foreground">{user?.primaryEmail || "No email set"}</p>
            </div>
            <span className={cn("text-muted-foreground transition-transform", expandedSection === "email" && "rotate-90")}>›</span>
          </button>
          {expandedSection === "email" && (
            <form onSubmit={handleChangeEmail} className="px-5 pb-5 flex flex-col gap-3 border-t border-border/50">
              {emailError && (
                <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                  {emailError}
                </div>
              )}
              {emailSuccess && (
                <div className="mt-3 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-600">
                  {emailSuccess}
                </div>
              )}
              <div className="flex flex-col gap-2 mt-3">
                <Label className="text-xs font-medium text-muted-foreground">New Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new@email.com"
                    required
                    className="h-10 pl-8 text-sm"
                  />
                </div>
              </div>
              <Button type="submit" disabled={emailLoading} className="gradient-purple text-white mt-1">
                {emailLoading ? "Updating..." : "Update Email"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-4 rounded-xl hover:bg-red-50 transition-colors text-left"
          >
            <div className="flex items-center justify-center size-9 rounded-lg bg-red-100">
              <LogOut className="size-4 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Sign Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account</p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardContent className="p-0">
          <button
            onClick={() => toggleSection("delete")}
            className="flex items-center gap-3 w-full px-5 py-4 text-left"
          >
            <div className="flex items-center justify-center size-9 rounded-lg bg-red-100">
              <Trash2 className="size-4 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <span className={cn("text-muted-foreground transition-transform", expandedSection === "delete" && "rotate-90")}>›</span>
          </button>
          {expandedSection === "delete" && (
            <form onSubmit={handleDeleteAccount} className="px-5 pb-5 flex flex-col gap-3 border-t border-destructive/20">
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-600">
                {deleteConfirm
                  ? "This action is irreversible. All your data will be permanently deleted."
                  : "This will permanently delete your account and all associated data."}
              </div>
              {deleteError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                  {deleteError}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Enter your password to confirm</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showDeletePassword ? "text" : "password"}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-10 pl-8 pr-9 text-sm"
                  />
                  <button type="button" onClick={() => setShowDeletePassword(!showDeletePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showDeletePassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={deleteLoading} variant="destructive" className="mt-1">
                {deleteLoading ? "Deleting..." : deleteConfirm ? "Yes, Delete My Account" : "Delete Account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
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

function LanguageSettings({ onBack }: { onBack: () => void }) {
  const { t, language, isBurmese } = useTranslation();
  const { LanguageSwitch } = require("@/lib/i18n");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold">{t("settings_language")}</h2>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground">
              Choose your preferred language. Burmese text uses different typography for better readability.
            </p>
            
            {/* Beautiful Language Toggle */}
            <div className="flex justify-center">
              <LanguageSwitch size="lg" showLabels={true} />
            </div>
            
            {/* Typography Preview */}
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <h3 className="text-sm font-semibold mb-3">Typography Preview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Font Family</span>
                  <span className="text-xs font-medium">
                    {isBurmese ? "Padauk" : "Inter"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Line Height</span>
                  <span className="text-xs font-medium">
                    {isBurmese ? "1.8 (relaxed)" : "1.5 (normal)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Font Size</span>
                  <span className="text-xs font-medium">
                    {isBurmese ? "6.25% larger" : "Standard"}
                  </span>
                </div>
              </div>
              
              {/* Sample text */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm" style={{ lineHeight: isBurmese ? "1.8" : "1.5" }}>
                  {isBurmese 
                    ? "မြန်မာဘာသာစကားသည် ပိုမိုကြီးမားသော မျဉ်းအမြင့်နှင့် ဖတ်ရလွယ်ကူရန် အရွယ်အစားပိုကြီးသော ဖောင့်များလိုအပ်ပါသည်။"
                    : "The quick brown fox jumps over the lazy dog. This text demonstrates the typography differences between English and Burmese scripts."}
                </p>
              </div>
            </div>
            
            <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-primary">Note:</strong> Burmese script requires more vertical space and larger font sizes for proper readability. The app automatically adjusts line height and font size when Burmese is selected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
