import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";

type StartResponse = {
  status?: string;
  code?: string;
  url?: string;
};

export type TelegramCompleteResult = {
  status?: string;
  signedIn?: boolean;
  created?: boolean;
  linked?: boolean;
};

type Props = {
  /** Called once when the server reports status "ok". */
  onComplete?: (result: TelegramCompleteResult) => void;
  className?: string;
};

const POLL_MS = 2500;
const CODE_TTL_MS = 5 * 60_000;

/**
 * "Continue with Telegram" — mints a one-time deep-link code, opens the bot
 * chat, and polls `/telegram/complete` until the user taps Start there. Used
 * by login, register and the Settings link view.
 */
export function TelegramSignIn({ onComplete, className }: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"idle" | "starting" | "waiting">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const pollingRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pollingRef.current = false;
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const start = useCallback(async () => {
    setError(null);
    setPhase("starting");
    try {
      const res = await fetch("/api/auth/telegram/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json().catch(() => ({}))) as StartResponse;
      if (data.status === "ok" && data.url && data.code) {
        setUrl(data.url);
        setPhase("waiting");
        poll(data.code);
      } else if (data.status === "throttled") {
        setError(t("auth_telegram_throttled"));
        setPhase("idle");
      } else if (data.status === "unconfigured") {
        setError(t("auth_telegram_unavailable"));
        setPhase("idle");
      } else {
        setError(t("auth_error_unexpected"));
        setPhase("idle");
      }
    } catch {
      setError(t("auth_error_unexpected"));
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  function poll(code: string) {
    stopPolling();
    const startedAt = Date.now();
    timerRef.current = window.setInterval(() => {
      if (pollingRef.current) return;
      if (Date.now() - startedAt > CODE_TTL_MS) {
        stopPolling();
        setError(t("auth_telegram_expired"));
        setPhase("idle");
        return;
      }
      pollingRef.current = true;
      fetch("/api/auth/telegram/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          const data = (await res.json().catch(() => ({}))) as TelegramCompleteResult;
          if (data.status === "ok") {
            stopPolling();
            setPhase("idle");
            setUrl(null);
            onComplete?.(data);
          } else if (data.status === "expired" || data.status === "invalid") {
            stopPolling();
            setError(t("auth_telegram_expired"));
            setPhase("idle");
          } else if (data.status === "conflict") {
            stopPolling();
            setError(t("auth_telegram_conflict"));
            setPhase("idle");
          }
        })
        .catch(() => {
          // transient network error — keep polling
        })
        .finally(() => {
          pollingRef.current = false;
        });
    }, POLL_MS);
  }

  function cancel() {
    stopPolling();
    setPhase("idle");
    setUrl(null);
    setError(null);
  }

  if (phase === "waiting" && url) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <Button
          type="button"
          size="lg"
          className="w-full font-semibold"
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        >
          <Send className="mr-2 size-4" />
          {t("auth_telegram_open")}
        </Button>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t("auth_telegram_waiting")}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {t("auth_telegram_hint")}
        </p>
        <button
          type="button"
          onClick={cancel}
          className="mx-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {t("cancel")}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button
        type="button"
        size="lg"
        className="w-full font-semibold"
        disabled={phase === "starting"}
        onClick={start}
      >
        {phase === "starting" ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Send className="mr-2 size-4" />
        )}
        {t("auth_telegram_continue")}
      </Button>
    </div>
  );
}
