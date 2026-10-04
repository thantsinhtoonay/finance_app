import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Dashboard } from "@/components/budget/dashboard";
import { OpenInTelegram } from "@/components/auth/open-in-telegram";
import { initDisplayCurrency } from "@/lib/settings/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useTranslation } from "@/lib/i18n/store";

export const Route = createFileRoute("/")({
  component: Home,
});

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
  const [landing, setLanding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const attempted = useRef(false);

  // Telegram-only sign-in: when opened from the Mini App, post the raw initData
  // once — the server validates it and auto-registers/loads the account keyed
  // by the Telegram user id, then we reload so the fresh session cookie rules.
  // Outside Telegram (or after a failed attempt) show the landing page.
  useEffect(() => {
    if (user || isPending || attempted.current) return;
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.initData) {
      setLanding(true);
      return;
    }
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
        setAuthError(`${t("landing_auth_error")} (${detail})`);
      } catch {
        setAuthError(`${t("landing_auth_error")} (network)`);
      }
      setLanding(true);
    })();
  }, [user, isPending, t]);

  if (user) {
    return (
      <main>
        <Dashboard />
      </main>
    );
  }

  if (isPending || !landing) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  return <OpenInTelegram error={authError} />;
}
