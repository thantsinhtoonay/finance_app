/**
 * Pure data layer for export reports (CSV/PDF). No DOM, no jsPDF — unit-testable.
 */
import { categoryById } from "./categories.ts";
import type { Transaction } from "./types";

export type ReportRow = {
  date: string;
  type: "income" | "expense";
  category: string;
  note: string;
  amount: number;
};

/** Sorted (date asc) export rows, optionally scoped to a "yyyy-MM" month key. */
export function buildReportRows(
  transactions: Transaction[],
  month?: string,
): ReportRow[] {
  const txs = month
    ? transactions.filter((t) => t.date.startsWith(month))
    : transactions;
  return [...txs]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((t) => ({
      date: t.date,
      type: t.type,
      category: categoryById(t.category).label,
      note: t.note ?? "",
      amount: t.amount,
    }));
}

export function summarizeReport(rows: ReportRow[]): {
  income: number;
  expense: number;
  net: number;
  count: number;
} {
  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r.type === "income") income += r.amount;
    else expense += r.amount;
  }
  return { income, expense, net: income - expense, count: rows.length };
}
