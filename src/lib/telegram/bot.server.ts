import { env } from "../env.server.ts";
import { secretsMatch } from "./core.ts";

/**
 * Telegram Bot API client (server-only — the token never reaches the client).
 * All failures throw; callers in webhook/cron/export paths catch and log so a
 * bot outage never breaks the app itself.
 */

export class TelegramNotConfiguredError extends Error {
  constructor() {
    super("TELEGRAM_BOT_TOKEN is not set");
    this.name = "TelegramNotConfiguredError";
  }
}

export function telegramToken(): string | undefined {
  return env("TELEGRAM_BOT_TOKEN");
}

export function telegramConfigured(): boolean {
  return Boolean(telegramToken());
}

export function botUsername(): string | undefined {
  return env("TELEGRAM_BOT_USERNAME");
}

/** `t.me/<bot>?start=<code>` deep link — requires TELEGRAM_BOT_USERNAME. */
export function botStartUrl(code: string): string | null {
  const username = botUsername();
  return username ? `https://t.me/${username}?start=${code}` : null;
}

/**
 * Webhook auth: Telegram echoes `secret_token` back in
 * `X-Telegram-Bot-Api-Secret-Token`. Fails closed when the secret is unset.
 */
export function webhookSecretMatches(header: string | null): boolean {
  const secret = env("TELEGRAM_WEBHOOK_SECRET");
  return secretsMatch(header, secret ?? "");
}

type ApiResult<T> = { ok: true; result: T } | { ok: false; error_code: number; description: string };

async function telegramApi<T>(method: string, payload: unknown): Promise<T> {
  const token = telegramToken();
  if (!token) throw new TelegramNotConfiguredError();
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json().catch(() => null)) as ApiResult<T> | null;
  if (!data || data.ok !== true) {
    const desc = data && data.ok === false ? data.description : `HTTP ${res.status}`;
    throw new Error(`telegram ${method} failed: ${desc}`);
  }
  return data.result;
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  await telegramApi("sendMessage", { chat_id: chatId, text });
}

export async function sendDocument(
  chatId: string,
  filename: string,
  content: string,
  mimeType: string,
  caption: string,
): Promise<void> {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("document", new File([content], filename, { type: mimeType }));
  const token = telegramToken();
  if (!token) throw new TelegramNotConfiguredError();
  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  const data = (await res.json().catch(() => null)) as ApiResult<unknown> | null;
  if (!data || data.ok !== true) {
    const desc = data && data.ok === false ? data.description : `HTTP ${res.status}`;
    throw new Error(`telegram sendDocument failed: ${desc}`);
  }
}

/** One-time webhook registration (run manually after deploy). */
export async function setWebhook(url: string, secret: string): Promise<void> {
  await telegramApi("setWebhook", {
    url,
    secret_token: secret,
    drop_pending_updates: true,
    allowed_updates: ["message"],
  });
}
