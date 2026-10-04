import { createHmac } from "node:crypto";
import { secretsMatch } from "./core.ts";

/**
 * Telegram Mini App `initData` validation (server-only — needs node:crypto).
 *
 * Algorithm per https://core.telegram.org/bots/webapps#validating-data-received-via-mini-apps:
 *   secret_key = HMAC_SHA256(bot_token, "WebAppData")          // raw bytes
 *   hash       = hex(HMAC_SHA256(data_check_string, secret_key))
 *
 * data-check-string = every `key=value` pair EXCEPT `hash`, sorted
 * alphabetically, joined with "\n". Values are the decoded (percent-unescape)
 * query values. `signature` (Ed25519, Bot API 7.2+) is an ordinary field here —
 * only the third-party Ed25519 check excludes it.
 *
 * `auth_date` is enforced (≤ maxAge) so a captured payload can't be replayed
 * forever; the window is generous (default 7 days) because a Mini App window can
 * stay open across a session expiry — reopening from the bot always yields
 * fresh initData anyway.
 */

export type TelegramWebAppUser = {
  id: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
};

export type InitDataValidation =
  | { ok: true; user: TelegramWebAppUser; authDate: number }
  | { ok: false; reason: "malformed" | "bad_hash" | "bad_auth_date" | "missing_user" };

const DEFAULT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
/** Tolerated clock skew for a future auth_date (Telegram generates it server-side). */
const FUTURE_SKEW_SECONDS = 600;

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  options?: { now?: number; maxAgeSeconds?: number },
): InitDataValidation {
  if (!initData || !botToken) return { ok: false, reason: "malformed" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "malformed" };

  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  if (pairs.length === 0) return { ok: false, reason: "malformed" };
  pairs.sort();

  const secretKey = createHmac("sha256", botToken).update("WebAppData").digest();
  const expected = createHmac("sha256", secretKey).update(pairs.join("\n")).digest("hex");
  if (!secretsMatch(expected, hash)) return { ok: false, reason: "bad_hash" };

  const now = options?.now ?? Math.floor(Date.now() / 1000);
  const maxAge = options?.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || authDate <= 0) return { ok: false, reason: "bad_auth_date" };
  if (authDate > now + FUTURE_SKEW_SECONDS) return { ok: false, reason: "bad_auth_date" };
  if (now - authDate > maxAge) return { ok: false, reason: "bad_auth_date" };

  const rawUser = params.get("user");
  if (!rawUser) return { ok: false, reason: "missing_user" };
  try {
    const parsed = JSON.parse(rawUser) as Record<string, unknown>;
    const id = Number(parsed.id);
    const firstName = typeof parsed.first_name === "string" ? parsed.first_name : "";
    if (!Number.isInteger(id) || id <= 0 || !firstName) {
      return { ok: false, reason: "missing_user" };
    }
    return {
      ok: true,
      authDate,
      user: {
        id,
        firstName,
        lastName: typeof parsed.last_name === "string" ? parsed.last_name : null,
        username: typeof parsed.username === "string" ? parsed.username : null,
      },
    };
  } catch {
    return { ok: false, reason: "missing_user" };
  }
}
