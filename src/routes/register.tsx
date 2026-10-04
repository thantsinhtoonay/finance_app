import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { MyanmarSkyline } from "@/components/ui/myanmar-skyline";
import { LanguageSwitch } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/store";
import { UserGuide } from "@/components/budget/user-guide";
import { TelegramSignIn } from "@/components/auth/telegram-sign-in";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth_error_mismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth_error_min_length"));
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || t("auth_error_register"));
      } else {
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(t("auth_error_unexpected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Full Myanmar skyline background */}
      <MyanmarSkyline className="pointer-events-none absolute bottom-0 left-0 w-full h-[50vh] min-h-[280px] text-primary opacity-40" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/logo.jpg"
            alt="Shal Su Logo"
            className="size-24 rounded-full object-cover mb-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-foreground">Shal Su</h1>
          <p className="text-muted-foreground mt-1">{t("auth_register_subtitle")}</p>
        </div>

        <div className="mb-6 flex justify-center">
          <LanguageSwitch size="sm" showLabels={true} />
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <TelegramSignIn onComplete={() => navigate({ to: "/" })} />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                {t("auth_telegram_or")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{t("auth_full_name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t("auth_email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t("auth_password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">{t("auth_confirm_password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={loading}
              >
                {loading ? t("auth_creating_account") : t("auth_create_account")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <UserGuide className="mt-4" />

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth_have_account")}{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t("auth_signin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
