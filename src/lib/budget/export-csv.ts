import { categoryById } from "./categories";
import type { Transaction } from "./types";

/**
 * One CSV cell: neutralize spreadsheet formula injection (`=`, `+`, `-`, `@`
 * at the start) and quote-wrap anything containing quotes/commas/newlines.
 */
export function csvCell(value: string | number): string {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportToCsv(transactions: Transaction[], month?: string): string {
  const txs = month
    ? transactions.filter((t) => t.date.startsWith(month))
    : transactions;

  const header = "Date,Type,Category,Amount,Note,Recurring";
  const rows = [...txs]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) => {
      const cat = categoryById(t.category);
      return [t.date, t.type, cat.label, t.amount, t.note, t.recurring || ""]
        .map(csvCell)
        .join(",");
    });

  return [header, ...rows].join("\n");
}
