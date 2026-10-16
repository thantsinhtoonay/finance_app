import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReportRows, summarizeReport } from "./report-data.ts";
import type { Transaction } from "./types.ts";

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: "id",
    type: "expense",
    amount: 0,
    category: "food",
    date: "2026-01-01",
    note: "",
    ...partial,
  } as Transaction;
}

test("buildReportRows sorts ascending by date and resolves category labels", () => {
  const rows = buildReportRows([
    tx({ date: "2026-01-15", category: "transport", amount: 3000 }),
    tx({ date: "2026-01-02", category: "food", amount: 1200 }),
    tx({ date: "2026-01-09", type: "income", category: "salary", amount: 500000 }),
  ]);
  assert.equal(rows.length, 3);
  assert.equal(rows[0]!.date, "2026-01-02");
  assert.equal(rows[0]!.category, "Food");
  assert.equal(rows[1]!.date, "2026-01-09");
  assert.equal(rows[1]!.type, "income");
  assert.equal(rows[2]!.category, "Transport");
});

test("buildReportRows scopes to a month key", () => {
  const rows = buildReportRows(
    [
      tx({ date: "2026-01-05", amount: 100 }),
      tx({ date: "2026-02-05", amount: 200 }),
      tx({ date: "2026-02-20", amount: 300 }),
    ],
    "2026-02",
  );
  assert.equal(rows.length, 2);
  assert.deepEqual(
    rows.map((r) => r.amount),
    [200, 300],
  );
});

test("summarizeReport totals income, expense and net", () => {
  const rows = buildReportRows([
    tx({ type: "income", amount: 500000, category: "salary" }),
    tx({ type: "expense", amount: 12000, category: "food" }),
    tx({ type: "expense", amount: 3000, category: "transport" }),
  ]);
  const s = summarizeReport(rows);
  assert.equal(s.income, 500000);
  assert.equal(s.expense, 15000);
  assert.equal(s.net, 485000);
  assert.equal(s.count, 3);
});

test("summarizeReport of empty rows is all zeros", () => {
  const s = summarizeReport([]);
  assert.deepEqual(s, { income: 0, expense: 0, net: 0, count: 0 });
});
