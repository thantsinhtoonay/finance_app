/**
 * Pure helpers for the Telegram integration — no fetch, no env, no DB.
 *
 * Everything here is deterministic (or crypto-only), so it runs identically in
 * the Better Auth plugin, the webhook/cron routes, and `node --test`.
 */

/** Crypto-random one-time deep-link code: unambiguous alphabet, 8 chars. */
export const AUTH_CODE_LENGTH = 8;

export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateAuthCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(AUTH_CODE_LENGTH));
  let out = "";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

/** Codes are matched case-insensitively; anything else is rejected early. */
export function normalizeAuthCode(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  return new RegExp(`^[${CODE_ALPHABET}]{${AUTH_CODE_LENGTH}}$`).test(code)
    ? code
    : null;
}

/**
 * Extract the payload of a private `/start` command.
 * Handles `/start code`, `/start@bot code` (Telegram group style) and a bare
 * `/start` (returns null — the user tapped Start without a link payload).
 */
export function parseStartCommand(text: string | undefined | null): string | null {
  if (!text) return null;
  const match = text.trim().match(/^\/start(?:@\S+)?(?:\s+([^\s]+))?/i);
  const payload = match?.[1];
  if (!payload) return null;
  return normalizeAuthCode(payload);
}

export type TelegramSender = {
  chatId: string;
  telegramUserId: string;
  username: string;
  displayName: string;
};

/** Pull the private-chat sender out of a Bot API `Update`. */
export function extractSender(update: unknown): TelegramSender | null {
  if (!update || typeof update !== "object") return null;
  const message = (update as { message?: Record<string, unknown> }).message;
  if (!message || typeof message !== "object") return null;
  const chat = message.chat as { id?: number; type?: string } | undefined;
  const from = message.from as
    | { id?: number; username?: string; first_name?: string; last_name?: string }
    | undefined;
  if (!chat || typeof chat.id !== "number") return null;
  if (chat.type && chat.type !== "private") return null;
  if (!from || typeof from.id !== "number") return null;

  const parts = [from.first_name, from.last_name].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  return {
    chatId: String(chat.id),
    telegramUserId: String(from.id),
    username: from.username ?? "",
    displayName: parts.join(" ") || from.username || "Telegram user",
  };
}

export type MessageText = {
  text: string;
  username: string;
  displayName: string;
};

/** Parse `message.text` for `/start <code>` against a sender. */
export function startMessageSender(update: unknown): { code: string; sender: TelegramSender } | null {
  if (!update || typeof update !== "object") return null;
  const text = (update as { message?: { text?: string } }).message?.text;
  const code = parseStartCommand(text);
  if (!code) return null;
  const sender = extractSender(update);
  if (!sender) return null;
  return { code, sender };
}

// ── Monthly summary ─────────────────────────────────────────────────────────

export type SummaryCategory = { category: string; total: number };

export type MonthlySummaryStats = {
  monthLabel: string;
  income: number;
  expense: number;
  transactionCount: number;
  topCategories: SummaryCategory[];
  goal: number;
};

function money(value: number): string {
  // MMK default via the shared formatter — the server never has a display
  // currency preference (that lives in localStorage), so summaries use MMK.
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  const body = `MMK ${formatted}`;
  return value < 0 ? `\u2212${body}` : body;
}

/** Bot message for the monthly summary (sent once per month per link). */
export function formatMonthlySummary(stats: MonthlySummaryStats): string {
  const lines: string[] = [
    `📊 Shal Su — ${stats.monthLabel} Summary`,
    "",
    `Income:   ${money(stats.income)}`,
    `Expenses: ${money(stats.expense)}`,
    `Net:      ${money(stats.income - stats.expense)}`,
  ];

  const top = stats.topCategories.filter((c) => c.total > 0).slice(0, 5);
  if (top.length > 0) {
    lines.push("", "Top spending:");
    top.forEach((c, i) => {
      lines.push(`${i + 1}. ${c.category} — ${money(c.total)}`);
    });
  }

  if (stats.goal > 0) {
    const remaining = stats.goal - stats.expense;
    const verdict =
      remaining >= 0
        ? `✅ ${money(remaining)} to spare`
        : `⚠️ ${money(Math.abs(remaining))} over`;
    lines.push("", `Goal: ${money(stats.goal)} — ${verdict}`);
  }

  lines.push("", `Transactions: ${stats.transactionCount}`);
  return lines.join("\n");
}

// ── Account event messages ──────────────────────────────────────────────────

export function signInProgressMessage(when: string, ip: string | null): string {
  const base = `🔓 New sign-in to Shal Su (${when})`;
  return ip ? `${base} from IP ${ip}.` : `${base}.`;
}

export function telegramLinkedMessage(displayName: string): string {
  return `✅ Telegram linked to Shal Su as ${displayName}. Exports and monthly summaries will be delivered here.`;
}

export function telegramUnlinkedMessage(): string {
  return `❎ Telegram unlinked from Shal Su. You can relink any time from Settings.`;
}

/** Bot message for `/start` and first-open welcome (Open button attached by sender). */
export function webAppWelcomeMessage(displayName: string): string {
  return `👋 Welcome, ${displayName}!\n\nTap the button below to open Shal Su — track income, expenses, budgets, and savings.`;
}

// ── Export naming ───────────────────────────────────────────────────────────

export type ExportKind = "csv-month" | "csv-all" | "backup-json";

export function exportFilename(kind: ExportKind, month?: string, today?: string): string {
  const day = today ?? new Date().toISOString().slice(0, 10);
  switch (kind) {
    case "csv-month":
      return `shalsu-${month ?? day}.csv`;
    case "csv-all":
      return `shalsu-transactions-${day}.csv`;
    case "backup-json":
      return `shalsu-backup-${day}.json`;
  }
}

export function exportCaption(kind: ExportKind): string {
  switch (kind) {
    case "csv-month":
      return "Shal Su export — this month's transactions (CSV)";
    case "csv-all":
      return "Shal Su export — all transactions (CSV)";
    case "backup-json":
      return "Shal Su export — full backup (JSON)";
  }
}

// ── Shared secret comparison ────────────────────────────────────────────────

/** Length-checked, branch-constant comparison (webhook + cron auth). */
export function secretsMatch(a: string | null | undefined, b: string): boolean {
  if (!a) return false;
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i]! ^ bb[i]!;
  return diff === 0;
}

// ── Rate limiting (in-memory, best effort on serverless) ────────────────────

/**
 * Fixed-window counter keyed by caller (IP). Returns true when the key is
 * still over the limit at `now`. Entries outside the window are dropped as
 * they are visited, so the map only grows when callers keep probing.
 */
export function throttle(
  hits: Map<string, number[]>,
  key: string,
  now: number,
  limit = 5,
  windowMs = 60_000,
): boolean {
  const cutoff = now - windowMs;
  const times = (hits.get(key) ?? []).filter((t) => t > cutoff);
  const over = times.length >= limit;
  if (!over) times.push(now);
  hits.set(key, times);
  return over;
}
