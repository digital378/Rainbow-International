/**
 * SEO regression monitor
 *
 * Runs five checks against rainbowinternationalschool.in every 24 hours.
 * Sends an email alert via SMTP when any check fails.
 *
 * Checks mirror the curl assertions in scripts/seo-check.mjs:
 *   1. og:image present on homepage
 *   2. Cache-Control: no-store (no s-maxage) on HTML
 *   3. /amenities returns 200 (no redirect loop)
 *   4. /preschool-thane 301-redirects to /pre-primary-school-thane
 *   5. Homepage JSON-LD contains EducationalOrganization schema
 */

import nodemailer from "nodemailer";

const PROD_BASE = "https://rainbowinternationalschool.in";
const BOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const REQUEST_TIMEOUT_MS = 20_000;
const REQUEST_ATTEMPTS = 3;
const RETRY_DELAY_MS = 750;

/** Interval between scheduled checks (24 hours). */
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Delay before the first run after server startup (1 minute). */
const STARTUP_DELAY_MS = 60 * 1_000;

export interface SeoCheckResult {
  name: string;
  passed: boolean;
  kind?: "regression" | "availability";
  /** Human-readable detail — only meaningful when passed is false. */
  detail?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type FetchPageOptions = {
  fetchImpl?: typeof fetch;
  attempts?: number;
  retryDelayMs?: number;
};

const wait = (ms: number) =>
  ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

async function fetchPage(
  path: string,
  options: FetchPageOptions = {},
): Promise<{ res: Response; body: string }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const attempts = options.attempts ?? REQUEST_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? RETRY_DELAY_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetchImpl(`${PROD_BASE}${path}`, {
        redirect: "manual",
        headers: { "User-Agent": BOT_UA },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (res.status >= 500) {
        throw new Error(`HTTP ${res.status} from ${path}`);
      }
      const body = res.status < 300 ? await res.text() : "";
      return { res, body };
    } catch (err) {
      lastError = err;
      if (attempt < attempts) await wait(retryDelayMs * attempt);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Unable to fetch ${path}`);
}

// ── The five checks ───────────────────────────────────────────────────────────

export async function runSeoChecks(
  options: FetchPageOptions = {},
): Promise<SeoCheckResult[]> {
  const results: SeoCheckResult[] = [];

  const ok = (name: string) => results.push({ name, passed: true });
  const fail = (
    name: string,
    detail: string,
    kind: SeoCheckResult["kind"] = "regression",
  ) => results.push({ name, passed: false, detail, kind });

  // Fetch the homepage once so one run evaluates a consistent response and
  // does not triple the chance of a transient network timeout.
  let homepage: { res: Response; body: string } | null = null;
  try {
    homepage = await fetchPage("/", options);
  } catch (err) {
    fail(
      "Homepage available for SEO verification",
      `Monitor could not verify the homepage after ${options.attempts ?? REQUEST_ATTEMPTS} attempts: ${String(err)}`,
      "availability",
    );
  }

  // 1. og:image on homepage
  if (homepage) {
    if (
      homepage.body.includes("og:image") &&
      homepage.body.includes("opengraph.jpg")
    ) {
      ok("og:image present on homepage");
    } else {
      fail(
        "og:image present on homepage",
        "og:image meta tag missing or does not reference opengraph.jpg",
      );
    }
  }

  // 2. No s-maxage on homepage HTML
  // The dangerous regression is s-maxage being re-enabled, which lets a CDN
  // cache bot-vs-browser-differentiated HTML and serve the wrong version.
  // `private` or `no-store` are both fine; only `s-maxage` is a red flag.
  if (homepage) {
    const cc = homepage.res.headers.get("cache-control") || "";
    if (!cc.includes("s-maxage")) {
      ok("Cache-Control: no s-maxage on homepage HTML");
    } else {
      fail(
        "Cache-Control: no s-maxage on homepage HTML",
        `Got: "${cc}" — s-maxage would let a CDN cache bot vs browser HTML`,
      );
    }
  }

  // 3. /amenities no redirect loop
  try {
    const { res } = await fetchPage("/amenities", options);
    const loc = res.headers.get("location") || "";
    const isLoop =
      res.status >= 300 &&
      res.status < 400 &&
      loc.replace(/\/+$/, "").endsWith("/amenities");
    if (isLoop) {
      fail("/amenities no redirect loop", `Redirect loop detected → ${loc}`);
    } else if (res.status === 200 || (res.status >= 300 && res.status < 400)) {
      ok("/amenities returns 200 (no redirect loop)");
    } else {
      fail(
        "/amenities no redirect loop",
        `Unexpected status: ${res.status}`,
      );
    }
  } catch (err) {
    fail(
      "/amenities available for SEO verification",
      `Monitor could not verify /amenities: ${String(err)}`,
      "availability",
    );
  }

  // 4. /preschool-thane 301 → /pre-primary-school-thane
  try {
    const { res } = await fetchPage("/preschool-thane", options);
    const loc = res.headers.get("location") || "";
    if (res.status === 301 && loc.includes("/pre-primary-school-thane")) {
      ok("/preschool-thane 301 → /pre-primary-school-thane");
    } else {
      fail(
        "/preschool-thane 301 → /pre-primary-school-thane",
        `Status: ${res.status}, Location: "${loc}"`,
      );
    }
  } catch (err) {
    fail(
      "/preschool-thane available for SEO verification",
      `Monitor could not verify /preschool-thane: ${String(err)}`,
      "availability",
    );
  }

  // 5. Homepage JSON-LD EducationalOrganization
  if (homepage) {
    if (homepage.body.includes("EducationalOrganization")) {
      ok("Homepage JSON-LD EducationalOrganization schema");
    } else {
      fail(
        "Homepage JSON-LD EducationalOrganization schema",
        "EducationalOrganization not found in page source",
      );
    }
  }

  return results;
}

// ── Email alert ───────────────────────────────────────────────────────────────

function getSeoMailer() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  return {
    transport: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    }),
    from: `"RIS SEO Monitor" <${smtpUser}>`,
    to:
      process.env.ENQUIRY_MAIL_TO ||
      "digital@rainbowinternationalschool.in",
  };
}

async function sendAlertEmail(failures: SeoCheckResult[]): Promise<void> {
  const mailer = getSeoMailer();
  if (!mailer) {
    console.warn(
      "[seo-monitor] SMTP not configured — skipping alert email.",
    );
    return;
  }

  const rows = failures
    .map(
      (f) => `
      <tr>
        <td style="padding:8px 14px;border-bottom:1px solid #eee;color:#c0392b;font-weight:bold;">✗ ${f.name}</td>
        <td style="padding:8px 14px;border-bottom:1px solid #eee;">${f.detail ?? ""}</td>
      </tr>`,
    )
    .join("\n");

  const hasRegression = failures.some((failure) => failure.kind !== "availability");
  const heading = hasRegression
    ? "⚠️ SEO Regression Detected"
    : "⚠️ SEO Monitor Could Not Verify the Site";
  const intro = hasRegression
    ? "The following SEO checks failed"
    : "The monitor could not complete the following checks";
  const guidance = hasRegression
    ? "Fix the regression and re-deploy before Google re-crawls."
    : "No SEO regression has been confirmed. Check site availability and run the monitor again.";
  const subject = hasRegression
    ? `[SEO Alert] ${failures.length} regression${failures.length !== 1 ? "s" : ""} on rainbowinternationalschool.in`
    : `[SEO Monitor] unable to verify rainbowinternationalschool.in`;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
  <h2 style="color:#c0392b;">${heading}</h2>
  <p>${intro} on <strong>rainbowinternationalschool.in</strong>:</p>
  <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
    <thead>
      <tr style="background:#f9f9f9;">
        <th style="padding:8px 14px;text-align:left;border-bottom:1px solid #ddd;">Check</th>
        <th style="padding:8px 14px;text-align:left;border-bottom:1px solid #ddd;">Detail</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:16px;font-size:13px;color:#666;">
    Checked at <strong>${new Date().toISOString()}</strong> UTC.<br/>
    ${guidance}
  </p>
  <p style="font-size:12px;color:#999;">
    — RIS SEO Monitor (runs every 24 h automatically)
  </p>
</div>`;

  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    subject,
    html,
  });

  console.log(`[seo-monitor] Alert email sent to ${mailer.to}`);
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

/** Run checks and email on failures. Returns results for callers that want them. */
export async function runAndAlert(): Promise<SeoCheckResult[]> {
  console.log("[seo-monitor] Running SEO checks…");
  let results: SeoCheckResult[];
  try {
    results = await runSeoChecks();
  } catch (err) {
    console.error("[seo-monitor] Unexpected error running checks:", err);
    return [];
  }

  const failures = results.filter((r) => !r.passed);
  const passCount = results.filter((r) => r.passed).length;

  console.log(
    `[seo-monitor] ${passCount}/${results.length} checks passed` +
      (failures.length
        ? ` — FAILED: ${failures.map((f) => f.name).join(", ")}`
        : ""),
  );

  if (failures.length > 0) {
    await sendAlertEmail(failures).catch((err) =>
      console.error("[seo-monitor] Could not send alert email:", err),
    );
  }

  return results;
}

/**
 * Start the daily SEO monitor.
 * First run fires STARTUP_DELAY_MS after this is called; then repeats every 24 h.
 * Call once during server startup (production only).
 */
export function startSeoMonitor(): void {
  setTimeout(async () => {
    await runAndAlert();
    setInterval(() => runAndAlert(), CHECK_INTERVAL_MS);
  }, STARTUP_DELAY_MS);

  console.log(
    `[seo-monitor] Scheduled daily SEO checks (first run in ${STARTUP_DELAY_MS / 1000}s)`,
  );
}
