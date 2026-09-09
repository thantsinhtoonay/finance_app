import { addMonths, format, parse, parseISO } from "date-fns";

export function monthKey(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function yearKey(date = new Date()): string {
  return format(date, "yyyy");
}

export function formatMonth(key: string): string {
  return format(parse(key, "yyyy-MM", new Date()), "MMMM yyyy");
}

export function formatMonthShort(key: string): string {
  return format(parse(key, "yyyy-MM", new Date()), "MMM yyyy");
}

export function shiftMonth(key: string, delta: number): string {
  return format(addMonths(parse(key, "yyyy-MM", new Date()), delta), "yyyy-MM");
}

export function formatDay(isoDate: string): string {
  return format(parseISO(isoDate), "MMM d");
}

export function formatDayFull(isoDate: string): string {
  return format(parseISO(isoDate), "MMM d, yyyy");
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
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return value < 0 ? `\u2212${formatted}` : formatted;
}

export function formatSigned(value: number, type: "income" | "expense"): string {
  const formatted = formatMoney(Math.abs(value));
  return type === "income" ? `+${formatted}` : `\u2212${formatted}`;
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, "");
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
