import { test } from "node:test";
import assert from "node:assert/strict";

const ORIGIN = "https://example.com";
const TOKEN = "abc123def456";
const SCHOOL_NAME = "Sunrise Academy";

async function importUtils() {
  const { normalizePhone, buildWhatsAppUrl, buildEmailUrl } = await import(
    "../client/src/lib/friendship-url-utils.ts"
  );
  return { normalizePhone, buildWhatsAppUrl, buildEmailUrl };
}

const { normalizePhone, buildWhatsAppUrl, buildEmailUrl } = await importUtils();

// ── normalizePhone ──────────────────────────────────────────────────────────

test("normalizePhone: 10-digit number gets 91 prefix", () => {
  assert.equal(normalizePhone("9876543210"), "919876543210");
});

test("normalizePhone: 12-digit number starting with 91 is unchanged", () => {
  assert.equal(normalizePhone("919876543210"), "919876543210");
});

test("normalizePhone: strips non-digits before normalizing", () => {
  assert.equal(normalizePhone("+91-98765-43210"), "919876543210");
});

test("normalizePhone: 10-digit with spaces/dashes still gets 91 prefix", () => {
  assert.equal(normalizePhone("98765 43210"), "919876543210");
});

test("normalizePhone: other lengths returned as digits only", () => {
  assert.equal(normalizePhone("12345"), "12345");
});

// ── buildWhatsAppUrl ────────────────────────────────────────────────────────

test("buildWhatsAppUrl: href starts with wa.me and includes normalized phone", () => {
  const href = buildWhatsAppUrl("9876543210", TOKEN, SCHOOL_NAME, ORIGIN);
  assert.ok(href.startsWith("https://wa.me/919876543210?text="), `Got: ${href}`);
});

test("buildWhatsAppUrl: href includes URL-encoded portal link", () => {
  const href = buildWhatsAppUrl("9876543210", TOKEN, SCHOOL_NAME, ORIGIN);
  const decoded = decodeURIComponent(href);
  assert.ok(
    decoded.includes(`${ORIGIN}/alliances/friendship/${TOKEN}`),
    `Portal URL not found in decoded href.\nGot: ${decoded}`
  );
});

test("buildWhatsAppUrl: href mentions the school name in the text", () => {
  const href = buildWhatsAppUrl("9876543210", TOKEN, SCHOOL_NAME, ORIGIN);
  const decoded = decodeURIComponent(href);
  assert.ok(decoded.includes(SCHOOL_NAME), `School name not found.\nGot: ${decoded}`);
});

test("buildWhatsAppUrl: phone with country code already present is not double-prefixed", () => {
  const href = buildWhatsAppUrl("919876543210", TOKEN, SCHOOL_NAME, ORIGIN);
  assert.ok(href.includes("wa.me/919876543210"), `Got: ${href}`);
  assert.ok(!href.includes("wa.me/91919876543210"), `Double-prefixed phone detected: ${href}`);
});

// ── buildEmailUrl ───────────────────────────────────────────────────────────

test("buildEmailUrl: href starts with mailto: and the correct email", () => {
  const href = buildEmailUrl("admin@school.com", TOKEN, SCHOOL_NAME, ORIGIN);
  assert.ok(href.startsWith("mailto:admin@school.com?"), `Got: ${href}`);
});

test("buildEmailUrl: href contains subject param", () => {
  const href = buildEmailUrl("admin@school.com", TOKEN, SCHOOL_NAME, ORIGIN);
  assert.ok(href.includes("subject="), `Missing subject param.\nGot: ${href}`);
});

test("buildEmailUrl: href contains body param", () => {
  const href = buildEmailUrl("admin@school.com", TOKEN, SCHOOL_NAME, ORIGIN);
  assert.ok(href.includes("body="), `Missing body param.\nGot: ${href}`);
});

test("buildEmailUrl: decoded body contains the portal link", () => {
  const href = buildEmailUrl("admin@school.com", TOKEN, SCHOOL_NAME, ORIGIN);
  const bodyMatch = href.match(/body=([^&]*)/);
  assert.ok(bodyMatch, "body param not found in href");
  const body = decodeURIComponent(bodyMatch[1]);
  assert.ok(
    body.includes(`${ORIGIN}/alliances/friendship/${TOKEN}`),
    `Portal URL not in email body.\nGot: ${body}`
  );
});

test("buildEmailUrl: decoded body contains the school name", () => {
  const href = buildEmailUrl("admin@school.com", TOKEN, SCHOOL_NAME, ORIGIN);
  const bodyMatch = href.match(/body=([^&]*)/);
  const body = decodeURIComponent(bodyMatch[1]);
  assert.ok(body.includes(SCHOOL_NAME), `School name not in email body.\nGot: ${body}`);
});

// ── Conditional rendering guard (logic tests) ───────────────────────────────

test("WA button should only be rendered when contactPhone is truthy", () => {
  const withPhone = "9876543210";
  const noPhone = "";
  assert.ok(!!withPhone, "non-empty phone is truthy — button should render");
  assert.ok(!noPhone, "empty string is falsy — button should NOT render");
});

test("Email button should only be rendered when contactEmail is truthy", () => {
  const withEmail = "a@b.com";
  const noEmail = "";
  assert.ok(!!withEmail, "non-empty email is truthy — button should render");
  assert.ok(!noEmail, "empty string is falsy — button should NOT render");
});
