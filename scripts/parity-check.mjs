#!/usr/bin/env node
import { chromium } from "playwright";
import { JSDOM } from "jsdom";

const BOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36";
const WARNING = /\b(?:best|no\.?\s*1|number one|top-rated|leading|premier|finest|world-class|trusted|guaranteed|seats filling|limited seats|hurry|Nursery|2026[-–]27|2025-26)\b|\(022\)\s*69105000|2597\s*6097/i;
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
    if (/^(HEADER|NAV|FOOTER|SCRIPT|STYLE|NOSCRIPT)$/.test(node.tagName)
      || node.hidden || node.getAttribute("aria-hidden") === "true") return;
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
  const bodyText = clean(text.join(" "));
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
    h1, words: bodyText ? bodyText.split(/\s+/).length : 0, bodyText, phones, emails,
    schemaTypes: [...schemaTypes].sort(), organizations, schemaErrors: errors,
    scrollWidth: browser ? document.documentElement.scrollWidth : null,
  };
}

export function compare(bot, visitor, path) {
  const rows = [];
  const add = (check, b, v, good, reason = "") =>
    rows.push({ Check: check, Bot: String(b), Visitor: String(v), Result: good ? "PASS" : "FAIL", Reason: good ? "" : reason });
  for (const key of ["title", "description", "canonical"]) {
    add(key, bot[key], visitor[key], !!bot[key] && bot[key] === visitor[key], "Missing or different");
  }
  add("robots", bot.robots, visitor.robots, true);
  add("H1 count", bot.h1.length, visitor.h1.length, bot.h1.length === 1 && visitor.h1.length === 1, "Both must have exactly one H1");
  add("H1 text", bot.h1.join(" | "), visitor.h1.join(" | "), JSON.stringify(bot.h1) === JSON.stringify(visitor.h1), "H1 text differs");
  add("body words", bot.words, visitor.words, bot.words >= visitor.words * 0.9, "Bot has less than 90% of visitor words");
  add("tel numbers", bot.phones.join(", "), visitor.phones.join(", "), bot.phones.length <= 1 && visitor.phones.length <= 1, "More than one distinct number");
  const allowedEmail = email => email === "admin@rainbowinternationalschool.in"
    || (path === "/career" && /^hr(?:[.@]|recruiter)[^@]*@rainbowinternationalschool\.in$/.test(email));
  add("mailto addresses", bot.emails.join(", "), visitor.emails.join(", "),
    [...bot.emails, ...visitor.emails].every(allowedEmail), "Unapproved school email");
  add("schema types", bot.schemaTypes.join(", "), visitor.schemaTypes.join(", "), true);
  add("JSON-LD validity", bot.schemaErrors.length, visitor.schemaErrors.length, !bot.schemaErrors.length && !visitor.schemaErrors.length, "Invalid JSON-LD");
  add("FAQPage nodes", bot.schemaTypes.includes("FAQPage"), visitor.schemaTypes.includes("FAQPage"),
    !bot.schemaTypes.includes("FAQPage") && !visitor.schemaTypes.includes("FAQPage"), "FAQPage is prohibited");
  add("organisation nodes", bot.organizations, visitor.organizations, bot.organizations <= 1 && visitor.organizations <= 1, "Duplicate organisations");
  add("mobile width", "—", visitor.scrollWidth, visitor.scrollWidth <= 390, "Horizontal overflow at 390px");
  const warnings = [];
  for (const [source, result] of [["bot", bot], ["visitor", visitor]]) {
    for (const sentence of result.bodyText.split(/(?<=[.!?])\s+(?=[A-Z])|\n+/)) {
      if (WARNING.test(sentence)) warnings.push({ source, sentence: sentence.trim() });
    }
  }
  return { rows, warnings, status: rows.some(row => row.Result === "FAIL") ? "FAIL" : warnings.length ? "WARN" : "PASS" };
}

async function read(url) {
  const response = await fetch(url, { headers: { "user-agent": BOT_UA }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}

async function main() {
  const args = process.argv.slice(2);
  const base = new URL(args.find(arg => !arg.startsWith("--")) || "http://localhost:5000");
  const pathArg = args.find(arg => arg.startsWith("--path="));
  const paths = [];
  if (pathArg) {
    const path = pathArg.slice(7);
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
  // No form interactions, screenshots, files, or data-changing HTTP requests.
  await context.route("**/*", route => ["GET", "HEAD", "OPTIONS"].includes(route.request().method()) ? route.continue() : route.abort());
  const totals = { PASS: 0, WARN: 0, FAIL: 0, SKIP: 0 };
  try {
    for (const url of paths) {
      if (protectedPath(url.pathname)) { totals.SKIP++; console.log(`SKIP ${url.pathname} (protected)`); continue; }
      const page = await context.newPage();
      try {
        const html = await read(url);
        const dom = new JSDOM(html);
        const bot = extract(false, dom.window.document);
        dom.window.close();
        const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 60000 });
        if (!response?.ok()) throw new Error(`Visitor HTTP ${response?.status() ?? "unknown"}`);
        await page.waitForTimeout(1500);
        const visitor = await page.evaluate(extract, true);
        const result = compare(bot, visitor, url.pathname);
        totals[result.status]++;
        console.log(`\n${result.status} ${url.href}`);
        console.table(result.rows);
        for (const warning of result.warnings) console.log(`WARN [${warning.source}] ${warning.sentence}`);
      } catch (error) {
        totals.FAIL++;
        console.log(`\nFAIL ${url.href}: ${error.message}`);
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
  console.log("\nTotals:", totals);
  if (totals.FAIL) process.exitCode = 1;
}

if (process.argv[1]?.endsWith("parity-check.mjs")) main().catch(error => {
  console.error(`Parity checker failed: ${error.message}`);
  process.exitCode = 1;
});
