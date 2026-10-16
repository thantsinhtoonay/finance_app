import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { MyanmarSkyline } from "@/components/ui/myanmar-skyline";
import { LanguageSwitch } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/store";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: requestError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (requestError) {
        setError(requestError.message || t("auth_error_unexpected"));
      } else {
        setSent(true);
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
          <p className="text-muted-foreground mt-1">{t("forgot_title")}</p>
        </div>

        <div className="mb-6 flex justify-center">
          <LanguageSwitch size="sm" showLabels={true} />
        </div>

        <Card>
          <CardContent className="p-6">
            {sent ? (
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-foreground w-full">
                  {t("forgot_sent")}
                </div>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSent(false)}
                >
                  {t("reset_request_new")}
                </Button>
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    {t("forgot_back_login")}
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">{t("forgot_desc")}</p>

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

                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={loading}
                >
                  <Send className="size-4 mr-2" />
                  {loading ? t("forgot_sending") : t("forgot_submit")}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    {t("forgot_back_login")}
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
