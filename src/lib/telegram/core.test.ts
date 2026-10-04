import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_CODE_LENGTH,
  exportCaption,
  exportFilename,
  extractSender,
  formatMonthlySummary,
  generateAuthCode,
  normalizeAuthCode,
  parseStartCommand,
  signInProgressMessage,
  startMessageSender,
  telegramLinkedMessage,
  throttle,
} from "./core.ts";

describe("generateAuthCode", () => {
  it("matches the 8-char unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateAuthCode();
      assert.equal(code.length, AUTH_CODE_LENGTH);
      assert.match(code, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
      assert.equal(normalizeAuthCode(code), code);
    }
  });
});

describe("normalizeAuthCode", () => {
  it("uppercases and trims valid codes", () => {
    assert.equal(normalizeAuthCode(" ab7k2m9q "), "AB7K2M9Q");
  });
  it("rejects wrong length, spaces and ambiguous characters", () => {
    assert.equal(normalizeAuthCode("ABC123"), null);
    assert.equal(normalizeAuthCode("ABC123456789"), null);
    assert.equal(normalizeAuthCode("ABCD1FGH"), null); // 0/I/O/1 excluded
    assert.equal(normalizeAuthCode("ABCD EFG"), null);
    assert.equal(normalizeAuthCode(""), null);
  });
});

describe("parseStartCommand", () => {
  it("parses /start with payload", () => {
    assert.equal(parseStartCommand("/start AB7K2M9Q"), "AB7K2M9Q");
  });
  it("parses lowercase payloads and bot-qualified commands", () => {
    assert.equal(parseStartCommand("/start ab7k2m9q"), "AB7K2M9Q");
    assert.equal(parseStartCommand("/start@shalsu_finance_bot AB7K2M9Q"), "AB7K2M9Q");
  });
  it("returns null for bare /start or junk", () => {
    assert.equal(parseStartCommand("/start"), null);
    assert.equal(parseStartCommand("/help AB7K2M9Q"), null);
    assert.equal(parseStartCommand("hello"), null);
    assert.equal(parseStartCommand(undefined), null);
  });
});

describe("extractSender", () => {
  const update = {
    message: {
      chat: { id: -100123, type: "private" },
      from: { id: 4242, username: "moe", first_name: "Moe", last_name: "Aung" },
      text: "/start AB7K2M9Q",
    },
  };

  it("extracts a private-chat sender", () => {
    assert.deepEqual(extractSender(update), {
      chatId: "-100123",
      telegramUserId: "4242",
      username: "moe",
      displayName: "Moe Aung",
    });
  });
  it("falls back to username then a generic name", () => {
    const noName = {
      message: { chat: { id: 7, type: "private" }, from: { id: 7 } },
    };
    assert.equal(extractSender(noName)?.displayName, "Telegram user");
    const noFirst = {
      message: { chat: { id: 7, type: "private" }, from: { id: 7, username: "z" } },
    };
    assert.equal(extractSender(noFirst)?.displayName, "z");
  });
  it("rejects group chats and malformed updates", () => {
    const group = {
      message: { chat: { id: 9, type: "group" }, from: { id: 7 } },
    };
    assert.equal(extractSender(group), null);
    assert.equal(extractSender(null), null);
    assert.equal(extractSender({ message: {} }), null);
  });
  it("combines code + sender for a /start message", () => {
    assert.deepEqual(startMessageSender(update), {
      code: "AB7K2M9Q",
      sender: {
        chatId: "-100123",
        telegramUserId: "4242",
        username: "moe",
        displayName: "Moe Aung",
      },
    });
    assert.equal(startMessageSender({ message: { text: "/start" } }), null);
  });
});

describe("formatMonthlySummary", () => {
  it("renders totals, top categories and a met goal", () => {
    const text = formatMonthlySummary({
      monthLabel: "October 2026",
      income: 1200000,
      expense: 850000,
      transactionCount: 42,
      topCategories: [
        { category: "Food", total: 300000 },
        { category: "Transport", total: 120000 },
        { category: "Zero", total: 0 },
      ],
      goal: 900000,
    });
    assert.match(text, /📊 Shal Su — October 2026 Summary/);
    assert.match(text, /Income: {3}MMK 1,200,000/);
    assert.match(text, /Expenses: MMK 850,000/);
    assert.match(text, /Net: {6}MMK 350,000/);
    assert.match(text, /1\. Food — MMK 300,000/);
    assert.match(text, /2\. Transport — MMK 120,000/);
    assert.doesNotMatch(text, /Zero/);
    assert.match(text, /Goal: MMK 900,000 — ✅ MMK 50,000 to spare/);
    assert.match(text, /Transactions: 42/);
  });
  it("flags an over-budget month and omits an unset goal", () => {
    const text = formatMonthlySummary({
      monthLabel: "September 2026",
      income: 100,
      expense: 150,
      transactionCount: 2,
      topCategories: [],
      goal: 100,
    });
    assert.match(text, /Goal: MMK 100 — ⚠️ MMK 50 over/);
    assert.doesNotMatch(text, /Top spending/);

    const noGoal = formatMonthlySummary({
      monthLabel: "September 2026",
      income: 0,
      expense: 0,
      transactionCount: 0,
      topCategories: [],
      goal: 0,
    });
    assert.doesNotMatch(noGoal, /Goal:/);
  });
  it("shows a negative net with a minus sign", () => {
    const text = formatMonthlySummary({
      monthLabel: "August 2026",
      income: 5000,
      expense: 7000,
      transactionCount: 3,
      topCategories: [],
      goal: 0,
    });
    assert.match(text, /Net: {6}\u2212MMK 2,000/);
  });
});

describe("event + export copy", () => {
  it("builds sign-in / link messages", () => {
    assert.equal(
      signInProgressMessage("1 Jan 2026, 09:00", "1.2.3.4"),
      "🔓 New sign-in to Shal Su (1 Jan 2026, 09:00) from IP 1.2.3.4.",
    );
    assert.equal(
      signInProgressMessage("1 Jan 2026, 09:00", null),
      "🔓 New sign-in to Shal Su (1 Jan 2026, 09:00).",
    );
    assert.match(telegramLinkedMessage("Moe"), /linked to Shal Su as Moe/);
  });
  it("names export files deterministically", () => {
    assert.equal(exportFilename("csv-month", "2026-10", "2026-10-31"), "shalsu-2026-10.csv");
    assert.equal(exportFilename("csv-all", undefined, "2026-10-31"), "shalsu-transactions-2026-10-31.csv");
    assert.equal(exportFilename("backup-json", undefined, "2026-10-31"), "shalsu-backup-2026-10-31.json");
    assert.match(exportCaption("backup-json"), /full backup \(JSON\)/);
  });
});

describe("throttle", () => {
  it("allows `limit` calls per window then blocks, and resets after", () => {
    const hits = new Map<string, number[]>();
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) assert.equal(throttle(hits, "ip", now), false);
    assert.equal(throttle(hits, "ip", now), true);
    assert.equal(throttle(hits, "other", now), false);
    assert.equal(throttle(hits, "ip", now + 60_001), false);
  });
});
