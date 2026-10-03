import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dueOccurrences, nextRecurringDate } from "./recurring.ts";

describe("nextRecurringDate", () => {
  it("adds 7 days for weekly", () => {
    assert.equal(nextRecurringDate("2026-01-01", "weekly"), "2026-01-08");
    assert.equal(nextRecurringDate("2026-01-29", "weekly"), "2026-02-05");
  });

  it("adds 14 days for biweekly", () => {
    assert.equal(nextRecurringDate("2026-01-01", "biweekly"), "2026-01-15");
    assert.equal(nextRecurringDate("2026-12-28", "biweekly"), "2027-01-11");
  });

  it("keeps the day of month for monthly", () => {
    assert.equal(nextRecurringDate("2026-01-15", "monthly"), "2026-02-15");
    assert.equal(nextRecurringDate("2026-03-15", "monthly"), "2026-04-15");
  });

  it("rolls over year end for monthly", () => {
    assert.equal(nextRecurringDate("2026-12-15", "monthly"), "2027-01-15");
  });

  it("clamps month-end dates instead of overflowing", () => {
    assert.equal(nextRecurringDate("2026-01-31", "monthly"), "2026-02-28");
    assert.equal(nextRecurringDate("2024-01-31", "monthly"), "2024-02-29");
    assert.equal(nextRecurringDate("2026-03-31", "monthly"), "2026-04-30");
  });

  it("adds one year for yearly", () => {
    assert.equal(nextRecurringDate("2026-06-10", "yearly"), "2027-06-10");
    assert.equal(nextRecurringDate("2026-12-31", "yearly"), "2027-12-31");
  });

  it("turns Feb 29 into Feb 28 in common years", () => {
    assert.equal(nextRecurringDate("2024-02-29", "yearly"), "2025-02-28");
    assert.equal(nextRecurringDate("2024-02-29", "yearly").length, 10);
  });

  it("returns malformed dates unchanged", () => {
    assert.equal(nextRecurringDate("not-a-date", "weekly"), "not-a-date");
  });
});

describe("dueOccurrences", () => {
  it("excludes the anchor date and includes the until date", () => {
    assert.deepEqual(dueOccurrences("2026-01-05", "monthly", "2026-03-05"), [
      "2026-02-05",
      "2026-03-05",
    ]);
    assert.deepEqual(dueOccurrences("2026-01-01", "weekly", "2026-01-08"), [
      "2026-01-08",
    ]);
  });

  it("returns nothing when until is before the next occurrence", () => {
    assert.deepEqual(dueOccurrences("2026-01-05", "monthly", "2026-02-04"), []);
    assert.deepEqual(dueOccurrences("2026-01-05", "monthly", "2026-01-05"), []);
  });

  it("generates a bounded count for long ranges", () => {
    assert.ok(dueOccurrences("2000-01-01", "weekly", "2100-01-01").length <= 1000);
  });

  it("never loops forever on malformed input", () => {
    assert.deepEqual(dueOccurrences("bad", "weekly", "2026-01-01"), []);
  });
});
