import { addMonths, format, parse, parseISO } from "date-fns";
import type { CurrencyCode } from "@/lib/settings/types";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  MMK: "MMK",
  USD: "$",
  THB: "฿",
  JPY: "¥",
  EUR: "€",
};

let activeCurrency: CurrencyCode = "MMK";

export function setActiveCurrency(code: CurrencyCode): void {
  if (code in CURRENCY_SYMBOLS) activeCurrency = code;
}

export function getActiveCurrency(): CurrencyCode {
  return activeCurrency;
}

export function currencySymbol(code?: CurrencyCode): string {
  return CURRENCY_SYMBOLS[code ?? activeCurrency] ?? "MMK";
}

/* ─────────────────────────── language-aware dates ─────────────────────────── */

type AppLanguage = "en" | "my";

let activeLanguage: AppLanguage = "en";

const MONTHS_MY = [
  "ဇန်နဝါရီ",
  "ဖေဖော်ဝါရီ",
  "မတ်",
  "ဧပြီ",
  "မေ",
  "ဇွန်",
  "ဇူလိုင်",
  "ဩဂုတ်",
  "စက်တင်ဘာ",
  "အောက်တိုဘာ",
  "နိုဝင်ဘာ",
  "ဒီဇင်ဘာ",
];

const MONTHS_MY_SHORT = [
  "ဇန်",
  "ဖေ",
  "မတ်",
  "ဧပြီ",
  "မေ",
  "ဇွန်",
  "ဇူ",
  "ဩဂ",
  "စက်",
  "အောက်",
  "နိုဝ်",
  "ဒီ",
];

export function setActiveLanguage(lang: AppLanguage): void {
  activeLanguage = lang;
}

export function getActiveLanguage(): AppLanguage {
  return activeLanguage;
}

/** Short axis label for a month index (0 = January). */
export function monthShortLabel(monthIndex: number): string {
  const i = Math.min(11, Math.max(0, monthIndex));
  if (activeLanguage === "my") return MONTHS_MY_SHORT[i];
  return format(new Date(2000, i), "MMM");
}

export function monthKey(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function yearKey(date = new Date()): string {
  return format(date, "yyyy");
}

export function formatMonth(key: string): string {
  const date = parse(key, "yyyy-MM", new Date());
  if (activeLanguage === "my") return `${MONTHS_MY[date.getMonth()]} ${date.getFullYear()}`;
  return format(date, "MMMM yyyy");
}

export function formatMonthShort(key: string): string {
  const date = parse(key, "yyyy-MM", new Date());
  if (activeLanguage === "my") return `${MONTHS_MY_SHORT[date.getMonth()]} ${date.getFullYear()}`;
  return format(date, "MMM yyyy");
}

export function shiftMonth(key: string, delta: number): string {
  return format(addMonths(parse(key, "yyyy-MM", new Date()), delta), "yyyy-MM");
}

export function formatDay(isoDate: string): string {
  const date = parseISO(isoDate);
  if (activeLanguage === "my") return `${date.getDate()} ${MONTHS_MY[date.getMonth()]}`;
  return format(date, "MMM d");
}

export function formatDayFull(isoDate: string): string {
  const date = parseISO(isoDate);
  if (activeLanguage === "my") return `${date.getDate()} ${MONTHS_MY[date.getMonth()]} ${date.getFullYear()}`;
  return format(date, "MMM d, yyyy");
}

export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function defaultDateForMonth(month: string): string {
  const today = todayIso();
  if (today.startsWith(month)) return today;
  return `${month}-01`;
}

export function formatMoney(value: number): string {
  const symbol = currencySymbol();
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  const body = `${symbol} ${formatted}`;
  return value < 0 ? `\u2212${body}` : body;
}

export function formatSigned(value: number, type: "income" | "expense"): string {
  const formatted = formatMoney(Math.abs(value));
  return type === "income" ? `+${formatted}` : `\u2212${formatted}`;
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export function daysUntil(dateStr: string): number {
  const target = parseISO(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
