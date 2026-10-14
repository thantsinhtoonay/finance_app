import type { RecurringFrequency } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CATEGORY = 100;
const MAX_NOTE = 10_000;
/** Cap for receipt data URLs (~337KB of image after base64 expansion). */
export const MAX_RECEIPT_CHARS = 450_000;
const RECEIPT_DATA_URL = /^data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/**
 * Validate an optional receipt field. `undefined` means "leave unchanged"
 * (PUT semantics), `null` clears the receipt, and a string must be a
 * whitelisted image data URL within the size cap.
 */
function validateReceipt(
  receipt: unknown,
): { ok: true; value: string | null | undefined } | { ok: false; error: string } {
  if (receipt === undefined || receipt === null) return { ok: true, value: receipt };
  if (typeof receipt !== "string" || !RECEIPT_DATA_URL.test(receipt)) {
    return {
      ok: false,
      error: "receipt must be an image data URL (jpeg, png, or webp)",
    };
  }
  if (receipt.length > MAX_RECEIPT_CHARS) {
    return { ok: false, error: `receipt must be at most ${MAX_RECEIPT_CHARS} characters` };
  }
  return { ok: true, value: receipt };
}

const RECURRING_VALUES: readonly RecurringFrequency[] = [
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
];

/** True for a real calendar date in `YYYY-MM-DD` form (rejects 2026-13-99). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export type TransactionInput = {
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note: string;
  recurring: RecurringFrequency | null;
  receipt?: string | null;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

/**
 * Validate a transaction create/update body. Rejects wrong types (arrays and
 * objects used to slip through `Number()` coercion or land in the database as
 * garbage) and out-of-range values before any SQL runs.
 */
export function parseTransactionInput(
  body: unknown,
): ParseResult<TransactionInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const record = body as Record<string, unknown>;
  const { type, amount, category, date, note, recurring } = record;

  if (type !== "income" && type !== "expense") {
    return { ok: false, error: "type must be 'income' or 'expense'" };
  }

  const amountNum = toNumber(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return { ok: false, error: "amount must be a positive number" };
  }

  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.length > MAX_CATEGORY
  ) {
    return {
      ok: false,
      error: `category must be a non-empty string (max ${MAX_CATEGORY} characters)`,
    };
  }

  if (!isIsoDate(date)) {
    return { ok: false, error: "date must be a valid YYYY-MM-DD calendar date" };
  }

  if (note !== undefined && note !== null && typeof note !== "string") {
    return { ok: false, error: "note must be a string" };
  }
  if (typeof note === "string" && note.length > MAX_NOTE) {
    return { ok: false, error: `note must be at most ${MAX_NOTE} characters` };
  }

  // `""` mirrors the old `recurring || null` behavior.
  const recurringValue =
    recurring === undefined || recurring === "" ? null : recurring;
  if (recurringValue !== null && !RECURRING_VALUES.includes(recurringValue as RecurringFrequency)) {
    return {
      ok: false,
      error: "recurring must be one of weekly, biweekly, monthly, yearly",
    };
  }

  const receiptParsed = validateReceipt(record.receipt);
  if (!receiptParsed.ok) return receiptParsed;

  return {
    ok: true,
    value: {
      type,
      amount: amountNum,
      category,
      date,
      note: typeof note === "string" ? note : "",
      recurring: recurringValue as RecurringFrequency | null,
      ...(receiptParsed.value !== undefined ? { receipt: receiptParsed.value } : {}),
    },
  };
}

/** Validate a budget `categoryId` (arbitrary strings used to reach SQL). */
export function isValidCategoryId(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= MAX_CATEGORY
  );
}
