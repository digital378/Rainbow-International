#!/usr/bin/env node
import { chromium } from "playwright";
import { JSDOM } from "jsdom";

const BOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";
const BANNED_WORDS = [
  ["best", /\bbest\b/i], ["top", /\btop\b/i], ["No. 1", /\bno\.?\s*1\b/i],
  ["number one", /\bnumber one\b/i], ["leading", /\bleading\b/i],
  ["trusted", /\btrusted\b/i], ["premier", /\bpremier\b/i],
  ["finest", /\bfinest\b/i], ["world-class", /\bworld[-–]class\b/i],
  ["guaranteed", /\bguaranteed\b/i], ["seats filling", /\bseats filling\b/i],
  ["limited seats", /\blimited seats\b/i], ["almost full", /\balmost full\b/i],
  ["hurry", /\bhurry\b/i],
];
const protectedPath = path => /^\/(?:admin|sales|marketing|internal|alliances|rps-sales|declaration|leads|api|mcp|auth)(?:\/|$)/i.test(path) || /walk-?in/i.test(path);

// This function is also evaluated inside Chromium: keep it self-contained.
function extract(browser = false, suppliedDocument) {
  const document = suppliedDocument || globalThis.document;
  const clean = text => String(text || "").replace(/\s+/g, " ").trim();
  const roots = [document];
  const findRoots = root => {
    for (const element of root.querySelectorAll("*")) {
      if (element.shadowRoot) {
        roots.push(element.shadowRoot);
        findRoots(element.shadowRoot);
      }
    }
  };
  findRoots(document);
  const all = selector => roots.flatMap(root => [...root.querySelectorAll(selector)]);
  const text = [];
  const walk = node => {
    if (node.nodeType === 3) { text.push(node.textContent); return; }
    if (node.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(node.tagName)
      || node.hidden || node.getAttribute("aria-hidden") === "true") return;
    // Rule 5 exempts the whole testimonials section, not just one quoted phrase.
    if (node.tagName === "SECTION" && (
      node.id === "testimonials" || node.querySelector('[data-testid^="card-testimonial-"]')
    )) return;
    if (browser) {
      const style = document.defaultView.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return;
    } else {
      const style = node.getAttribute("style") || "";
      if (/display\s*:\s*none|visibility\s*:\s*hidden/i.test(style)) return;
    }
    if (node.tagName === "TEMPLATE") {
      if (node.hasAttribute("shadowrootmode")) for (const child of node.content.childNodes) walk(child);
      return;
    }
    if (node.shadowRoot) {
      for (const child of node.shadowRoot.childNodes) walk(child);
      return;
    }
    if (node.tagName === "SLOT" && browser && node.assignedNodes) {
      const assigned = node.assignedNodes({ flatten: true });
      for (const child of assigned.length ? assigned : node.childNodes) walk(child);
      return;
    }
    for (const child of node.childNodes) walk(child);
  };
  if (document.body) walk(document.body);
  const bodyText = clean(document.body?.innerText);
  const warningText = clean(text.join(" ")).replaceAll(
    "Which is the best CBSE school in Thane for my child?", "",
  );
  const schemas = [], errors = [];
  for (const script of all('script[type="application/ld+json"]')) {
    try { schemas.push(JSON.parse(script.textContent)); }
    catch (error) { errors.push(error.message); }
  }
  const schemaTypes = new Set();
  let organizations = 0;
  const visit = node => {
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (!node || typeof node !== "object") return;
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    types.filter(Boolean).forEach(type => schemaTypes.add(type));
    if (types.some(type => ["Organization", "EducationalOrganization", "School"].includes(type))) organizations++;
    Object.values(node).forEach(visit);
  };
  schemas.forEach(visit);
  const phones = [...new Set(all('a[href^="tel:"]').map(a => a.getAttribute("href").slice(4).replace(/\D/g, "")))].sort();
  const emails = [...new Set(all('a[href^="mailto:"]').flatMap(a =>
    decodeURIComponent(a.getAttribute("href").slice(7).split("?")[0]).split(/[,;]/).map(e => e.trim().toLowerCase())))].sort();
  const h1 = all("h1").map(element => {
    const clone = element.cloneNode(true);
    clone.querySelectorAll("br").forEach(br => br.replaceWith(" "));
    return clean(browser ? element.innerText : clone.textContent);
  });
  return {
    title: clean(document.title),
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
    robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
    h1, words: bodyText ? bodyText.split(/\s+/).length : 0, bodyText, warningText, phones, emails,
    schemaTypes: [...schemaTypes].sort(), organizations, schemaErrors: errors,
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "",
    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "",
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "",
  };
}

export function compare(bot, visitor, path) {
  const rows = [];
  const add = (check, b, v, good, reason = "") =>
    rows.push({ Check: check, Bot: String(b), Visitor: String(v), Result: good ? "PASS" : "FAIL", Reason: good ? "" : reason });
  for (const key of ["title", "description", "canonical"]) {
    add(key, bot[key], visitor[key], !!bot[key] && bot[key] === visitor[key], "Missing or different");
  }
  if (path === "/") for (const key of ["ogTitle", "ogDescription", "ogImage"]) {
    add(key, bot[key], visitor[key], !!bot[key] && bot[key] === visitor[key], "Missing or different");
  }
  add("robots", bot.robots, visitor.robots, true);
  add("H1 count", bot.h1.length, visitor.h1.length, bot.h1.length === 1 && visitor.h1.length === 1, "Both must have exactly one H1");
  add("H1 text", bot.h1.join(" | "), visitor.h1.join(" | "), JSON.stringify(bot.h1) === JSON.stringify(visitor.h1), "H1 text differs");
  const ratio = visitor.words ? bot.words / visitor.words : 0;
  const wordsMatch = ratio >= 0.9 && ratio <= 1.3;
  rows.push({ Check: "body words", Bot: String(bot.words), Visitor: String(visitor.words),
    Result: wordsMatch ? "PASS" : "WARN",
    Reason: wordsMatch ? "" : `Bot is ${(ratio * 100).toFixed(1)}% of visitor words; target 90–130%` });
  add("tel numbers", bot.phones.join(", "), visitor.phones.join(", "),
    path === "/" ? bot.phones.length === 1 && visitor.phones.length === 1
      && bot.phones[0] === "918291568972" && visitor.phones[0] === "918291568972"
      : bot.phones.length <= 1 && visitor.phones.length <= 1, "Unexpected distinct phone numbers");
  const allowedEmail = email => email === "admin@rainbowinternationalschool.in"
    || (path === "/career" && /^hr(?:[.@]|recruiter)[^@]*@rainbowinternationalschool\.in$/.test(email));
  add("mailto addresses", bot.emails.join(", "), visitor.emails.join(", "),
    [...bot.emails, ...visitor.emails].every(allowedEmail)
      && (path !== "/" || bot.emails.length === 1 && visitor.emails.length === 1), "Missing or unapproved school email");
  add("schema types", bot.schemaTypes.join(", "), visitor.schemaTypes.join(", "), true);
  add("JSON-LD validity", bot.schemaErrors.length, visitor.schemaErrors.length, !bot.schemaErrors.length && !visitor.schemaErrors.length, "Invalid JSON-LD");
  add("FAQPage nodes", bot.schemaTypes.includes("FAQPage"), visitor.schemaTypes.includes("FAQPage"),
    !bot.schemaTypes.includes("FAQPage") && !visitor.schemaTypes.includes("FAQPage"), "FAQPage is prohibited");
  add("organisation nodes", bot.organizations, visitor.organizations, bot.organizations <= 1 && visitor.organizations <= 1, "Duplicate organisations");
  const warnings = [];
  for (const [source, result] of [["bot", bot], ["visitor", visitor]]) {
    const found = BANNED_WORDS.filter(([, pattern]) => pattern.test(result.warningText ?? result.bodyText)).map(([word]) => word);
    rows.push({ Check: `${source} banned words`, Bot: source === "bot" ? found.join(", ") || "None" : "—",
      Visitor: source === "visitor" ? found.join(", ") || "None" : "—", Result: found.length ? "WARN" : "PASS", Reason: "Report only; testimonials and exact parent question excluded" });
    if (found.length) warnings.push({ source, sentence: `Banned words: ${found.join(", ")}` });
  }
  return { rows, warnings, status: rows.some(row => row.Result === "FAIL") ? "FAIL" : rows.some(row => row.Result === "WARN") ? "WARN" : "PASS" };
}

async function read(url) {
  const response = await fetch(url, { headers: { "user-agent": BOT_UA }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}

async function main() {
  const args = process.argv.slice(2);
  const base = new URL(args.find(arg => /^https?:\/\//.test(arg))
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000"));
  const pathArg = args.find(arg => arg.startsWith("--path="))
    || args.find(arg => arg.startsWith("/") && !arg.startsWith("//"));
  const paths = [];
  if (pathArg) {
    const path = pathArg.startsWith("--path=") ? pathArg.slice(7) : pathArg;
    if (!path.startsWith("/") || path.startsWith("//")) throw new Error("--path must be a local path beginning with /");
    paths.push(new URL(path, base));
  } else {
    const xml = await read(new URL("/sitemap.xml", base));
    const document = new JSDOM(xml, { contentType: "text/xml" }).window.document;
    const seen = new Set();
    const collect = async document => {
      const index = document.documentElement.localName === "sitemapindex";
      for (const loc of document.querySelectorAll("loc")) {
        const original = new URL(loc.textContent.trim());
        const url = new URL(original.pathname + original.search, base);
        if (seen.has(url.href)) continue;
        seen.add(url.href);
        if (index) await collect(new JSDOM(await read(url), { contentType: "text/xml" }).window.document);
        else paths.push(url);
      }
    };
    await collect(document);
  }
  const browser = await chromium.launch({
    headless: true, args: ["--no-sandbox"],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  });
  const context = await browser.newContext({ userAgent: MOBILE_UA, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const botContext = await browser.newContext({ userAgent: BOT_UA, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false });
  // No form interactions, screenshots, files, or data-changing HTTP requests.
  await context.route("**/*", route => ["GET", "HEAD", "OPTIONS"].includes(route.request().method()) ? route.continue() : route.abort());
  await botContext.route("**/*", route => ["GET", "HEAD", "OPTIONS"].includes(route.request().method()) ? route.continue() : route.abort());
  const totals = { PASS: 0, WARN: 0, FAIL: 0, SKIP: 0 };
  try {
    for (const url of paths) {
      if (protectedPath(url.pathname)) { totals.SKIP++; console.log(`SKIP ${url.pathname} (protected)`); continue; }
      const page = await context.newPage();
      const botPage = await botContext.newPage();
      try {
        const botResponse = await botPage.goto(url.href, { waitUntil: "domcontentloaded", timeout: 60000 });
        if (!botResponse?.ok()) throw new Error(`Bot HTTP ${botResponse?.status() ?? "unknown"}`);
        const bot = await botPage.evaluate(extract, true);
        const response = await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 60000 });
        if (!response?.ok()) throw new Error(`Visitor HTTP ${response?.status() ?? "unknown"}`);
        await page.waitForTimeout(1500);
        // The page grows as LazyVisible sections mount; re-read the height each step.
        for (let step = 0; step < 100; step++) {
          const atBottom = await page.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1);
          if (atBottom) break;
          await page.evaluate(() => window.scrollBy(0, 800));
          await page.waitForTimeout(150);
        }
        await page.waitForTimeout(1000);
        await page.evaluate(() => window.scrollTo(0, 0));
        const visitor = await page.evaluate(extract, true);
        const result = compare(bot, visitor, url.pathname);
        totals[result.status]++;
        console.log(`\n${result.status} ${url.href}`);
        console.table(result.rows);
        for (const warning of result.warnings) console.log(`WARN [${warning.source}] ${warning.sentence}`);
      } catch (error) {
        totals.FAIL++;
        console.log(`\nFAIL ${url.href}: ${error.message}`);
      } finally { await Promise.all([page.close(), botPage.close()]); }
    }
  } finally { await browser.close(); }
  console.log("\nTotals:", totals);
  if (totals.FAIL) process.exitCode = 1;
}

if (process.argv[1]?.endsWith("parity-check.mjs")) main().catch(error => {
  console.error(`Parity checker failed: ${error.message}`);
  process.exitCode = 1;
});
