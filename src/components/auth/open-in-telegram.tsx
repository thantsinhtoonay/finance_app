import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MyanmarSkyline } from "@/components/ui/myanmar-skyline";
import { LanguageSwitch } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/store";
import { UserGuide } from "@/components/budget/user-guide";
import { Send } from "lucide-react";

const BOT_URL = "https://t.me/shalsu_finance_bot";

/**
 * Entry page shown when the app opens WITHOUT a session and outside a
 * Telegram Mini App (so there is no initData to auto-sign-in with).
 * The only way into the app is the Telegram bot.
 */
export function OpenInTelegram({ error }: { error?: string | null }) {
  const { t } = useTranslation();

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
          <p className="text-muted-foreground mt-1 text-center">{t("landing_subtitle")}</p>
        </div>

        <div className="mb-6 flex justify-center">
          <LanguageSwitch size="sm" showLabels={true} />
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">{t("landing_hint")}</p>
            <Button
              type="button"
              className="w-full font-semibold gap-2"
              onClick={() => window.open(BOT_URL, "_blank", "noopener,noreferrer")}
            >
              <Send className="size-4" />
              {t("landing_open_telegram")}
            </Button>
          </CardContent>
        </Card>

        <UserGuide className="mt-4" />
      </div>
    </div>
  );
}
