import { test } from "node:test";
import assert from "node:assert/strict";
import { describeRequest, parseUserAgent } from "./device-info.ts";

test("parseUserAgent recognizes common browser/OS combos", () => {
  assert.equal(
    parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ),
    "Chrome on Windows",
  );
  assert.equal(
    parseUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    ),
    "Safari on iOS",
  );
  assert.equal(
    parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    ),
    "Edge on Windows",
  );
  assert.equal(
    parseUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"),
    "Firefox on Linux",
  );
  assert.equal(
    parseUserAgent(
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
    ),
    "Samsung Internet on Android",
  );
  assert.equal(parseUserAgent(""), "Unknown device");
  assert.equal(parseUserAgent(null), "Unknown device");
  assert.equal(parseUserAgent(undefined), "Unknown device");
});

test("describeRequest builds region from Vercel headers", () => {
  const headers = new Headers({
    "user-agent": "Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0",
    "x-vercel-ip-country": "MM",
    "x-vercel-ip-city": encodeURIComponent("Yangon"),
  });
  const info = describeRequest(headers);
  assert.equal(info.device, "Chrome on Windows");
  assert.equal(info.region, "Yangon, MM");
});

test("describeRequest falls back gracefully", () => {
  const countryOnly = describeRequest(
    new Headers({ "x-vercel-ip-country": "MM" }),
  );
  assert.equal(countryOnly.region, "MM");
  assert.equal(countryOnly.device, "Unknown device");

  const nothing = describeRequest(null);
  assert.equal(nothing.region, "Unknown location");
  assert.equal(nothing.device, "Unknown device");

  // Bad URL-encoding in city must not throw.
  const badCity = describeRequest(
    new Headers({ "x-vercel-ip-city": "%E0%A4%A", "x-vercel-ip-country": "MM" }),
  );
  assert.equal(badCity.region, "%E0%A4%A, MM");
});
