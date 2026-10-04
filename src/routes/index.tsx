import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, RotateCcw } from "lucide-react";
import { Dashboard } from "@/components/budget/dashboard";
import { Button } from "@/components/ui/button";
import { initDisplayCurrency } from "@/lib/settings/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useTranslation } from "@/lib/i18n/store";

export const Route = createFileRoute("/")({
  component: Home,
});

const BOT_URL = "https://t.me/shalsu_finance_bot";

// The Telegram Mini App SDK (loaded in __root head) exposes this global.
type TelegramWebApp = {
  initData: string;
  ready?: () => void;
  expand?: () => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

// useLayoutEffect warns during SSR — effects never run on the server anyway.
const useClientLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function Home() {
  // SSR always renders the MMK default, but the settings store rehydrates on
  // the client with the user's persisted currency. This subtree's first
  // (hydration) render must stay the server's MMK text — so apply the real
  // currency in a layout effect afterwards, then re-render before paint.
  const [, setCurrencyReady] = useState(0);
  useClientLayoutEffect(() => {
    initDisplayCurrency();
    setCurrencyReady((n) => n + 1);
  }, []);

  const { user, isPending } = useCurrentUserState();
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const attempted = useRef(false);

  // Telegram-only sign-in: there is no login page. Opened from the Mini App we
  // post the raw initData once — the server validates it and auto-registers or
  // loads the account keyed by the Telegram user id, then we reload so the
  // fresh session cookie rules. Opened outside Telegram (SDK missing or empty
  // initData), hand off to the bot after a short wait for the SDK.
  useEffect(() => {
    if (user || isPending) return;
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.initData) {
      const timer = setTimeout(() => {
        if (!window.Telegram?.WebApp?.initData) window.location.href = BOT_URL;
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (attempted.current) return;
    attempted.current = true;
    webApp.ready?.();
    webApp.expand?.();
    (async () => {
      try {
        const res = await fetch("/api/auth/telegram/webapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: webApp.initData }),
        });
        if (res.ok) {
          window.location.reload();
          return;
        }
        let detail = String(res.status);
        try {
          const body = (await res.json()) as { status?: string; reason?: string };
          if (body?.status) {
            detail += ` ${body.status}${body.reason ? "/" + body.reason : ""}`;
          }
        } catch {
          // non-JSON error body — status alone is the detail
        }
        setAuthError(`${t("auto_auth_error")} (${detail})`);
      } catch {
        setAuthError(`${t("auto_auth_error")} (network)`);
      }
    })();
  }, [user, isPending, t, attempt]);

  if (user) {
    return (
      <main>
        <Dashboard />
      </main>
    );
  }

  if (authError) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6">
        <p className="max-w-sm rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {authError}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            attempted.current = false;
            setAuthError(null);
            setAttempt((n) => n + 1);
          }}
        >
          <RotateCcw />
          {t("auto_auth_retry")}
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </main>
  );
}
