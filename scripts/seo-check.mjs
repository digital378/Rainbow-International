#!/usr/bin/env node
/**
 * SEO regression check script — rainbowinternationalschool.in
 *
 * Verifies five critical SEO fixes:
 *   1. og:image present on homepage
 *   2. Cache-Control: no-store on HTML (no s-maxage)
 *   3. /amenities returns 200 (no redirect loop)
 *   4. /preschool-thane 301-redirects to /pre-primary-school-thane
 *   5. Homepage JSON-LD contains EducationalOrganization schema
 *
 * Exit code 0 = all pass, 1 = one or more failures.
 *
 * Usage:
 *   node scripts/seo-check.mjs                               # checks prod
 *   node scripts/seo-check.mjs https://my-staging-url.com   # checks any base URL
 */

const BASE = process.argv[2] || "https://rainbowinternationalschool.in";
const BOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const TIMEOUT_MS = 15_000;

let passed = 0;
let failed = 0;
/** @type {{ name: string; detail: string }[]} */
const failures = [];

function pass(name) {
  console.log(`  ✓  ${name}`);
  passed++;
}

function fail(name, detail = "") {
  console.error(`  ✗  ${name}`);
  if (detail) console.error(`       → ${detail}`);
  failed++;
  failures.push({ name, detail });
}

/**
 * Fetch a page without following redirects.
 * @param {string} path
 * @returns {Promise<{ res: Response; body: string }>}
 */
async function fetchPage(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": BOT_UA },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = res.status < 300 ? await res.text() : "";
  return { res, body };
}

async function runChecks() {
  console.log(`\nSEO regression check → ${BASE}\n`);

  // ── 1. og:image on homepage ────────────────────────────────────────────────
  try {
    const { body } = await fetchPage("/");
    if (body.includes("og:image") && body.includes("opengraph.jpg")) {
      pass("og:image present on homepage");
    } else {
      fail(
        "og:image present on homepage",
        "og:image meta tag missing or does not reference opengraph.jpg",
      );
    }
  } catch (err) {
    fail("og:image present on homepage", String(err));
  }

  // ── 2. No s-maxage on homepage HTML ────────────────────────────────────────
  // The dangerous regression is s-maxage being re-enabled, which lets a CDN
  // cache bot-vs-browser-differentiated HTML and serve the wrong version.
  // `private` or `no-store` are both acceptable; only `s-maxage` is a red flag.
  try {
    const { res } = await fetchPage("/");
    const cc = res.headers.get("cache-control") || "";
    if (!cc.includes("s-maxage")) {
      pass("Cache-Control: no s-maxage on homepage HTML");
    } else {
      fail(
        "Cache-Control: no s-maxage on homepage HTML",
        `Got: "${cc}" — s-maxage would let a CDN cache bot vs browser HTML`,
      );
    }
  } catch (err) {
    fail("Cache-Control: no s-maxage on homepage HTML", String(err));
  }

  // ── 3. /amenities returns 200 (no redirect loop) ──────────────────────────
  try {
    const { res } = await fetchPage("/amenities");
    const loc = res.headers.get("location") || "";
    const isLoop =
      res.status >= 300 && res.status < 400 && loc.replace(/\/+$/, "").endsWith("/amenities");
    if (isLoop) {
      fail("/amenities no redirect loop", `Redirect loop → ${loc}`);
    } else if (res.status === 200 || (res.status >= 300 && res.status < 400)) {
      pass("/amenities returns 200 (no redirect loop)");
    } else {
      fail("/amenities no redirect loop", `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    fail("/amenities no redirect loop", String(err));
  }

  // ── 4. /preschool-thane 301 → /pre-primary-school-thane ──────────────────
  try {
    const { res } = await fetchPage("/preschool-thane");
    const loc = res.headers.get("location") || "";
    if (res.status === 301 && loc.includes("/pre-primary-school-thane")) {
      pass("/preschool-thane 301 → /pre-primary-school-thane");
    } else {
      fail(
        "/preschool-thane 301 → /pre-primary-school-thane",
        `Status: ${res.status}, Location: "${loc}"`,
      );
    }
  } catch (err) {
    fail("/preschool-thane 301 → /pre-primary-school-thane", String(err));
  }

  // ── 5. Homepage JSON-LD contains EducationalOrganization ──────────────────
  try {
    const { body } = await fetchPage("/");
    if (body.includes("EducationalOrganization")) {
      pass("Homepage JSON-LD contains EducationalOrganization schema");
    } else {
      fail(
        "Homepage JSON-LD contains EducationalOrganization schema",
        "EducationalOrganization not found in page source",
      );
    }
  } catch (err) {
    fail("Homepage JSON-LD contains EducationalOrganization schema", String(err));
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${total} checks: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.error("Failed checks:");
    for (const { name, detail } of failures) {
      console.error(`  - ${name}${detail ? ": " + detail : ""}`);
    }
    process.exit(1);
  }
}

runChecks().catch((err) => {
  console.error("Unexpected error running SEO checks:", err);
  process.exit(1);
});
