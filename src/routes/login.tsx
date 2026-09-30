import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { MyanmarSkyline } from "@/components/ui/myanmar-skyline";
import { LanguageSwitch } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/store";
import { UserGuide } from "@/components/budget/user-guide";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        setError(t("auth_error_invalid"));
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
          <p className="text-muted-foreground mt-1">{t("auth_signin_subtitle")}</p>
        </div>

        <div className="mb-6 flex justify-center">
          <LanguageSwitch size="sm" showLabels={true} />
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-gold text-white font-semibold"
                disabled={loading}
              >
                {loading ? t("auth_signing_in") : t("auth_signin")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <UserGuide className="mt-4" />

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth_no_account")}{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            {t("auth_signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
