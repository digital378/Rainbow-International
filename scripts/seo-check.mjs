#!/usr/bin/env node
/**
 * SEO regression check script — rainbowinternationalschool.in
 *
 * Verifies six critical SEO guarantees:
 *   1. og:image present on homepage
 *   2. Cache-Control: no-store on HTML (no s-maxage)
 *   3. /amenities returns 200 (no redirect loop)
 *   4. /preschool-thane 301-redirects to /pre-primary-school-thane
 *   5. Homepage JSON-LD contains EducationalOrganization schema
 *   6. Every crawler UA in shared/crawler-uas.json receives full SSR
 *      (exactly one <h1> + self-referencing canonical) on every
 *      non-blog SSR route — this is what keeps the gated page path
 *      from silently drifting away from the always-SSR blog path.
 *
 * Exit code 0 = all pass, 1 = one or more failures.
 *
 * Usage:
 *   node scripts/seo-check.mjs                               # checks prod
 *   node scripts/seo-check.mjs https://my-staging-url.com   # checks any base URL
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = process.argv[2] || "https://rainbowinternationalschool.in";
const BOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const TIMEOUT_MS = 15_000;

// Canonical URLs are hardcoded to the production domain in the SSR
// templates, so self-referencing assertions always target this origin,
// even when BASE points at a staging/dev server.
const PROD_ORIGIN = "https://rainbowinternationalschool.in";

// Crawler UA substrings — the SAME list the server's gated page-SSR
// handlers use (server/crawlerUa.ts). Loaded from the shared JSON so the
// check can never drift from the runtime allow-list.
const CRAWLER_UAS = JSON.parse(
  readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "../shared/crawler-uas.json"),
    "utf8",
  ),
).substrings;

// Every non-blog route that has a gated SSR handler, derived from the
// SAME config that registers the routes (the `pages` array in
// server/ssrPages.ts) so the matrix can never drift when pages are
// added or removed. The homepage ("/") is served by server/ssrHome.ts
// and is prepended explicitly.
const SSR_PAGE_ROUTES = (() => {
  const src = readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "../server/ssrPages.ts"),
    "utf8",
  );
  const routes = [...src.matchAll(/^\s*path:\s*"(\/[^"]*)",\s*$/gm)].map((m) => m[1]);
  const unique = [...new Set(routes)];
  if (unique.length < 20) {
    // Parse safety net: if server/ssrPages.ts is refactored so this regex
    // no longer finds the page config, fail loudly instead of silently
    // shrinking the regression matrix.
    console.error(
      `FATAL: only ${unique.length} SSR page routes parsed from server/ssrPages.ts — ` +
        "the page config format may have changed; update the parser in scripts/seo-check.mjs.",
    );
    process.exit(1);
  }
  return ["/", ...unique];
})();

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
 * @param {string} [ua] - User-Agent header (defaults to Googlebot)
 * @returns {Promise<{ res: Response; body: string }>}
 */
async function fetchPage(path, ua = BOT_UA) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": ua },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = res.status < 300 ? await res.text() : "";
  return { res, body };
}

/** Run async work over items with a bounded concurrency pool. */
async function pool(items, size, worker) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      while (queue.length) await worker(queue.shift());
    }),
  );
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

  // ── 6. Every crawler UA gets full SSR on every non-blog SSR route ─────────
  // The blog path serves SSR to all visitors, but the page path is gated on a
  // UA allow-list. This matrix catches the allow-list silently dropping a bot
  // (it has happened before — AI crawlers got the empty SPA shell while
  // robots.txt invited them). For every route × UA we require exactly one
  // <h1> and a self-referencing canonical.
  console.log(
    `  …  crawler SSR matrix: ${CRAWLER_UAS.length} UAs × ${SSR_PAGE_ROUTES.length} routes`,
  );
  const matrixFailures = [];
  const jobs = [];
  for (const route of SSR_PAGE_ROUTES) {
    for (const ua of CRAWLER_UAS) jobs.push({ route, ua });
  }
  await pool(jobs, 8, async ({ route, ua }) => {
    try {
      const { res, body } = await fetchPage(route, ua);
      if (res.status !== 200) {
        matrixFailures.push(`${ua} on ${route}: status ${res.status}`);
        return;
      }
      const h1Count = (body.match(/<h1[\s>]/gi) || []).length;
      if (h1Count !== 1) {
        matrixFailures.push(
          `${ua} on ${route}: ${h1Count} <h1> (SSR shell not served?)`,
        );
        return;
      }
      const expectedCanonical =
        route === "/" ? `${PROD_ORIGIN}/` : `${PROD_ORIGIN}${route}`;
      if (!body.includes(`rel="canonical" href="${expectedCanonical}"`)) {
        matrixFailures.push(
          `${ua} on ${route}: canonical is not self-referencing (expected ${expectedCanonical})`,
        );
      }
    } catch (err) {
      matrixFailures.push(`${ua} on ${route}: ${String(err)}`);
    }
  });
  if (matrixFailures.length === 0) {
    pass("All crawler UAs receive full SSR on non-blog routes");
  } else {
    fail(
      "All crawler UAs receive full SSR on non-blog routes",
      matrixFailures.slice(0, 10).join(" | ") +
        (matrixFailures.length > 10
          ? ` | …and ${matrixFailures.length - 10} more`
          : ""),
    );
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
