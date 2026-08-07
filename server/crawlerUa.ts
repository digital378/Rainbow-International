import crawlerUas from "../shared/crawler-uas.json";

/**
 * Single source of truth for crawler user-agent detection on the gated
 * page-SSR path (homepage + interior pages). The substring list lives in
 * shared/crawler-uas.json and is also consumed by scripts/seo-check.mjs,
 * so the regression check always tests exactly what the server matches.
 *
 * Matching is substring-based and case-insensitive so UA version bumps
 * (e.g. "CCBot/2.0" → "CCBot/3.0") don't drop a bot.
 *
 * Note: /blog/* intentionally has NO UA gate — it serves SSR to all
 * visitors. Do not use this regex there.
 */
export const CRAWLER_UA_SUBSTRINGS: string[] = crawlerUas.substrings;

export const CRAWLER_UA_RE = new RegExp(CRAWLER_UA_SUBSTRINGS.join("|"), "i");

export function isCrawlerUa(userAgent: string | undefined | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_UA_RE.test(userAgent.toLowerCase());
}
