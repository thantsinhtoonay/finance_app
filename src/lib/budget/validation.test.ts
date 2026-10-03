import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isIsoDate,
  isValidCategoryId,
  parseTransactionInput,
} from "./validation.ts";

test("isIsoDate accepts real calendar dates only", () => {
  assert.equal(isIsoDate("2026-10-03"), true);
  assert.equal(isIsoDate("2024-02-29"), true); // leap year
  assert.equal(isIsoDate("2026-02-29"), false); // not a leap year
  assert.equal(isIsoDate("2026-13-01"), false);
  assert.equal(isIsoDate("2026-00-10"), false);
  assert.equal(isIsoDate("2026-1-5"), false);
  assert.equal(isIsoDate(["2026-10-03"]), false);
  assert.equal(isIsoDate({ x: 1 }), false);
  assert.equal(isIsoDate(undefined), false);
});

test("parseTransactionInput accepts a valid payload", () => {
  const result = parseTransactionInput({
    type: "expense",
    amount: 5000,
    category: "food",
    date: "2026-10-01",
    note: "lunch",
    recurring: "monthly",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.type, "expense");
    assert.equal(result.value.amount, 5000);
    assert.equal(result.value.recurring, "monthly");
  }
});

test("parseTransactionInput accepts numeric strings and empty recurring", () => {
  const result = parseTransactionInput({
    type: "income",
    amount: "1200",
    category: "salary",
    date: "2026-10-01",
    recurring: "",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.amount, 1200);
    assert.equal(result.value.recurring, null);
    assert.equal(result.value.note, "");
  }
});

test("parseTransactionInput rejects wrong types and junk values", () => {
  assert.equal(parseTransactionInput(null).ok, false);
  assert.equal(parseTransactionInput([1, 2]).ok, false);
  assert.equal(
    parseTransactionInput({
      type: { x: 1 },
      amount: 5,
      category: "c",
      date: "2026-10-01",
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: 5,
      category: "c",
      date: ["2026-13-99"],
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: 5,
      category: "c",
      date: "2026-13-99",
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: "abc",
      category: "c",
      date: "2026-10-01",
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: -5,
      category: "c",
      date: "2026-10-01",
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: 5,
      category: "c",
      date: "2026-10-01",
      recurring: "hourly",
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: 5,
      category: { evil: true },
      date: "2026-10-01",
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: 5,
      category: "c",
      date: "2026-10-01",
      note: { payload: true },
    }).ok,
    false,
  );
  assert.equal(
    parseTransactionInput({
      type: "income",
      amount: 5,
      category: "c",
      date: "2026-10-01",
      note: "x".repeat(10_001),
    }).ok,
    false,
  );
});

test("isValidCategoryId", () => {
  assert.equal(isValidCategoryId("food"), true);
  assert.equal(isValidCategoryId(""), false);
  assert.equal(isValidCategoryId("   "), false);
  assert.equal(isValidCategoryId({ x: 1 }), false);
  assert.equal(isValidCategoryId("x".repeat(101)), false);
});
