import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { currencySymbol, formatMoney, formatSigned, getActiveCurrency, setActiveCurrency } from "./format.ts";

describe("currency symbols", () => {
  it("defaults to MMK", () => {
    setActiveCurrency("MMK");
    assert.equal(getActiveCurrency(), "MMK");
    assert.equal(formatMoney(1234567), "MMK 1,234,567");
    assert.equal(formatMoney(0), "MMK 0");
    assert.equal(currencySymbol(), "MMK");
  });

  it("switches to USD ($)", () => {
    setActiveCurrency("USD");
    assert.equal(formatMoney(1234), "$1,234");
    assert.equal(currencySymbol(), "$");
    assert.equal(currencySymbol("USD"), "$");
  });

  it("switches to THB (฿)", () => {
    setActiveCurrency("THB");
    assert.equal(formatMoney(1234), "฿1,234");
  });

  it("switches to JPY (¥)", () => {
    setActiveCurrency("JPY");
    assert.equal(formatMoney(1234), "¥1,234");
  });

  it("switches to EUR (€)", () => {
    setActiveCurrency("EUR");
    assert.equal(formatMoney(1234), "€1,234");
  });

  it("keeps minus sign for negatives", () => {
    setActiveCurrency("USD");
    assert.equal(formatMoney(-500), "\u2212$500");
    setActiveCurrency("MMK");
    assert.equal(formatMoney(-500), "\u2212MMK 500");
  });

  it("formats signed income and expense", () => {
    setActiveCurrency("THB");
    assert.equal(formatSigned(2500, "income"), "+฿2,500");
    assert.equal(formatSigned(2500, "expense"), "\u2212฿2,500");
    setActiveCurrency("MMK");
  });

  it("ignores unknown codes", () => {
    // @ts-expect-error — deliberately invalid runtime input
    setActiveCurrency("XXX");
    assert.equal(getActiveCurrency(), "MMK");
  });
});
