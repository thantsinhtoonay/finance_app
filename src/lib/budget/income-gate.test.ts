import { test } from "node:test";
import assert from "node:assert/strict";
import type { Sql } from "../db.ts";
import { hasIncomeExcept, incomeRequired } from "./income-gate.server.ts";

function fakeSql(
  rows: unknown[],
  capture?: { text?: string; params?: unknown[] },
): Sql {
  return {
    query: async (text: string, params?: unknown[]) => {
      if (capture) {
        capture.text = text;
        capture.params = params;
      }
      return rows;
    },
  } as unknown as Sql;
}

test("hasIncomeExcept is false when no income rows exist", async () => {
  const capture: { text?: string; params?: unknown[] } = {};
  const result = await hasIncomeExcept(fakeSql([], capture), "user-1");
  assert.equal(result, false);
  assert.match(capture.text ?? "", /type = 'income'/);
  assert.equal(capture.text?.includes("id <>"), false);
  assert.deepEqual(capture.params, ["user-1"]);
});

test("hasIncomeExcept is true when an income row exists", async () => {
  const result = await hasIncomeExcept(fakeSql([{ "?column?": 1 }]), "user-1");
  assert.equal(result, true);
});

test("hasIncomeExcept with excludeId excludes the row being edited", async () => {
  const capture: { text?: string; params?: unknown[] } = {};
  const result = await hasIncomeExcept(
    fakeSql([], capture),
    "user-1",
    "tx-9",
  );
  assert.equal(result, false);
  assert.match(capture.text ?? "", /id <> \$2/);
  assert.deepEqual(capture.params, ["user-1", "tx-9"]);
});

test("incomeRequired responds 409 with income_required error", async () => {
  const res = incomeRequired();
  assert.equal(res.status, 409);
  const body = (await res.json()) as { error: string; message: string };
  assert.equal(body.error, "income_required");
  assert.ok(body.message.length > 0);
});
