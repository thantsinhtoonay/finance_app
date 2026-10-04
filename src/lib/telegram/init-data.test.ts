import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { validateTelegramInitData, type TelegramWebAppUser } from "./init-data.ts";

const BOT_TOKEN = "1234567:TEST_TOKEN_value";
const NOW = 1_760_000_000;

function sign(fields: Record<string, string>, botToken = BOT_TOKEN): string {
  const pairs = Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secret = createHmac("sha256", botToken).update("WebAppData").digest();
  const hash = createHmac("sha256", secret).update(pairs).digest("hex");
  const params = new URLSearchParams(fields);
  params.set("hash", hash);
  return params.toString();
}

function validFields(overrides?: Record<string, string>): Record<string, string> {
  return {
    auth_date: String(NOW),
    query_id: "AAF_abc123",
    user: JSON.stringify({ id: 987654321, first_name: "Aye", last_name: "Chan", username: "aye_chan" }),
    ...overrides,
  };
}

function okUser(result: ReturnType<typeof validateTelegramInitData>): TelegramWebAppUser {
  assert.equal(result.ok, true, `expected ok, got ${result.ok ? "" : JSON.stringify(result)}`);
  if (!result.ok) throw new Error("unreachable");
  return result.user;
}

describe("validateTelegramInitData", () => {
  it("accepts a correctly signed payload and maps the user", () => {
    const result = validateTelegramInitData(sign(validFields()), BOT_TOKEN, { now: NOW });
    const user = okUser(result);
    assert.deepEqual(user, {
      id: 987654321,
      firstName: "Aye",
      lastName: "Chan",
      username: "aye_chan",
    });
    assert.equal(result.ok && result.authDate, NOW);
  });

  it("defaults missing optional user fields to null", () => {
    const fields = validFields({ user: JSON.stringify({ id: 42, first_name: "Ko" }) });
    const user = okUser(validateTelegramInitData(sign(fields), BOT_TOKEN, { now: NOW }));
    assert.deepEqual(user, { id: 42, firstName: "Ko", lastName: null, username: null });
  });

  it("validates values after percent-decoding (spaces in names)", () => {
    const fields = validFields({ user: JSON.stringify({ id: 7, first_name: "Aa Aa" }) });
    const user = okUser(validateTelegramInitData(sign(fields), BOT_TOKEN, { now: NOW }));
    assert.equal(user.firstName, "Aa Aa");
  });

  it("rejects a tampered payload (user swapped after signing)", () => {
    const raw = new URLSearchParams(sign(validFields()));
    raw.set("user", JSON.stringify({ id: 111, first_name: "Mall" }));
    const result = validateTelegramInitData(raw.toString(), BOT_TOKEN, { now: NOW });
    assert.deepEqual(result, { ok: false, reason: "bad_hash" });
  });

  it("rejects a payload signed with a different bot token", () => {
    const result = validateTelegramInitData(
      sign(validFields(), "999:OTHER_TOKEN"),
      BOT_TOKEN,
      { now: NOW },
    );
    assert.deepEqual(result, { ok: false, reason: "bad_hash" });
  });

  it("accepts a hash computed over the signature field (canonical rule)", () => {
    const fields = validFields({ signature: "MEUCIQDx_real" });
    const user = okUser(validateTelegramInitData(sign(fields), BOT_TOKEN, { now: NOW }));
    assert.equal(user.id, 987654321);
  });

  it("accepts a hash computed without the signature field (fallback rule)", () => {
    const fields = validFields();
    const noSigHash = sign(fields); // hash over fields WITHOUT signature
    const raw = new URLSearchParams(noSigHash);
    raw.set("signature", "MEUCIQDx_real");
    const user = okUser(validateTelegramInitData(raw.toString(), BOT_TOKEN, { now: NOW }));
    assert.equal(user.id, 987654321);
  });

  it("ignores a bogus signature but never a tampered core field", () => {
    const fields = validFields();
    const noSigHash = sign(fields);
    const raw = new URLSearchParams(noSigHash);
    raw.set("signature", "bogus-signature");
    assert.equal(validateTelegramInitData(raw.toString(), BOT_TOKEN, { now: NOW }).ok, true);

    const tampered = new URLSearchParams(raw.toString());
    tampered.set("user", JSON.stringify({ id: 111, first_name: "Mall" }));
    assert.deepEqual(validateTelegramInitData(tampered.toString(), BOT_TOKEN, { now: NOW }), {
      ok: false,
      reason: "bad_hash",
    });
  });

  it("rejects empty inputs, missing hash, or hash-only payloads", () => {
    assert.deepEqual(validateTelegramInitData("", BOT_TOKEN, { now: NOW }), {
      ok: false,
      reason: "malformed",
    });
    assert.deepEqual(validateTelegramInitData("auth_date=1", "", { now: NOW }), {
      ok: false,
      reason: "malformed",
    });
    assert.deepEqual(validateTelegramInitData("auth_date=1", BOT_TOKEN, { now: NOW }), {
      ok: false,
      reason: "malformed",
    });
    assert.deepEqual(validateTelegramInitData("hash=abc", BOT_TOKEN, { now: NOW }), {
      ok: false,
      reason: "malformed",
    });
  });

  it("rejects expired auth_date beyond the max age", () => {
    const tooOld = NOW - 7 * 24 * 60 * 60 - 1;
    const fields = validFields({ auth_date: String(tooOld) });
    const result = validateTelegramInitData(sign(fields), BOT_TOKEN, { now: NOW });
    assert.deepEqual(result, { ok: false, reason: "bad_auth_date" });
  });

  it("enforces a custom maxAgeSeconds", () => {
    const fields = validFields({ auth_date: String(NOW - 100) });
    const result = validateTelegramInitData(sign(fields), BOT_TOKEN, {
      now: NOW,
      maxAgeSeconds: 50,
    });
    assert.deepEqual(result, { ok: false, reason: "bad_auth_date" });
  });

  it("accepts slight future auth_date (clock skew) but rejects far-future", () => {
    const nearFuture = validFields({ auth_date: String(NOW + 300) });
    assert.equal(validateTelegramInitData(sign(nearFuture), BOT_TOKEN, { now: NOW }).ok, true);

    const farFuture = validFields({ auth_date: String(NOW + 3600) });
    assert.deepEqual(validateTelegramInitData(sign(farFuture), BOT_TOKEN, { now: NOW }), {
      ok: false,
      reason: "bad_auth_date",
    });
  });

  it("rejects missing, zero, or non-numeric auth_date", () => {
    const noDate = validFields();
    delete noDate["auth_date"];
    assert.deepEqual(validateTelegramInitData(sign(noDate), BOT_TOKEN, { now: NOW }), {
      ok: false,
      reason: "bad_auth_date",
    });

    for (const value of ["0", "-5", "yesterday"]) {
      const fields = validFields({ auth_date: value });
      assert.deepEqual(validateTelegramInitData(sign(fields), BOT_TOKEN, { now: NOW }), {
        ok: false,
        reason: "bad_auth_date",
      });
    }
  });

  it("rejects missing or malformed user", () => {
    const noUser = validFields();
    delete noUser["user"];
    assert.deepEqual(validateTelegramInitData(sign(noUser), BOT_TOKEN, { now: NOW }), {
      ok: false,
      reason: "missing_user",
    });

    for (const user of ["{not json", JSON.stringify({ first_name: "NoId" }), JSON.stringify({ id: 0, first_name: "Zero" }), JSON.stringify({ id: 1.5, first_name: "Frac" }), JSON.stringify({ id: 5, first_name: "" })]) {
      const fields = validFields({ user });
      assert.deepEqual(validateTelegramInitData(sign(fields), BOT_TOKEN, { now: NOW }), {
        ok: false,
        reason: "missing_user",
      });
    }
  });
});
