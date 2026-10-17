import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { MyanmarSkyline } from "@/components/ui/myanmar-skyline";
import { LanguageSwitch } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/store";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { token?: string; error?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, error: tokenError } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const linkInvalid = !token || tokenError === "INVALID_TOKEN";

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
    if (!token) {
      setError(t("reset_invalid"));
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      if (resetError) {
        setError(resetError.message || t("auth_error_unexpected"));
      } else {
        navigate({ to: "/login", search: { reset: true } });
      }
    } catch {
      setError(t("auth_error_unexpected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-background px-4 overflow-hidden">
      <MyanmarSkyline className="pointer-events-none absolute bottom-0 left-0 w-full h-[50vh] min-h-[280px] text-primary opacity-40" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/images/logo.jpg"
            alt="Shal Su Logo"
            className="size-24 rounded-full object-cover mb-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-foreground">Shal Su</h1>
          <p className="text-muted-foreground mt-1">{t("reset_title")}</p>
        </div>

        <div className="mb-6 flex justify-center">
          <LanguageSwitch size="sm" showLabels={true} />
        </div>

        <Card>
          <CardContent className="p-6">
            {linkInvalid ? (
              <div className="flex flex-col gap-4 items-center text-center">
                <AlertTriangle className="size-8 text-destructive" />
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {t("reset_invalid")}
                </div>
                <Link to="/forgot-password">
                  <Button type="button" className="w-full font-semibold">
                    {t("reset_request_new")}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">{t("reset_desc")}</p>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="newPassword">{t("auth_password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">
                    {t("auth_confirm_password")}
                  </Label>
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
                  {loading ? t("reset_updating") : t("reset_submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t("forgot_back_login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
