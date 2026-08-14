import { Router } from "express";

/**
 * Blog route registry — the single source of truth for which /blog/<slug> URLs
 * are real, intentional pages on this site.
 *
 * WHY THIS EXISTS
 * ---------------
 * Blog URLs on this site come from two different places:
 *
 *   1. The `blog_posts` database table (posts written in the admin panel).
 *   2. Hand-built pages that live only in code — bespoke SSR modules such as
 *      the Raksha Bandhan page, and static HTML folders under blog-pages/.
 *
 * Before this registry existed, only source (1) was ever consulted. A page that
 * lived purely in code was invisible to the rest of the routing layer, so the
 * server had no way to distinguish "a URL we deliberately built" from "a random
 * URL that has never existed". That is how a freshly created page could end up
 * being treated as unknown and swept into a legacy /blogs redirect.
 *
 * THE RULE
 * --------
 * Every blog URL this site intends to serve MUST be known here. A slug that is
 * registered here is protected: no legacy WordPress redirect, wildcard rule, or
 * catch-all is allowed to send it to /blogs. See `guardProtectedBlogPaths`.
 *
 * HOW TO ADD A NEW PAGE
 * ---------------------
 *   - Database post: nothing to do. Creating it through the admin API calls
 *     `noteBlogSlugAdded`, so it is protected the moment it is saved — no
 *     server restart required.
 *   - Code-owned page: call `registerCodeOwnedBlogSlug("<slug>")` inside the
 *     module that serves it, at registration time. One line, next to the route.
 */

/** Slugs served by bespoke code (custom SSR modules, static HTML folders). */
const codeOwnedSlugs = new Set<string>();

/** Slugs backed by a row in the blog_posts table. Refreshed at boot, then kept
 *  in sync incrementally as posts are created, renamed, and deleted. */
let dbSlugs = new Set<string>();

/** Normalise a slug so lookups are stable: lowercase, no surrounding slashes.
 *  Express matches paths case-insensitively, so the registry must too —
 *  otherwise /blog/Raksha-Bandhan-2026 would look unknown while it is served. */
function normalise(slug: string): string {
  return slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
}

/**
 * Declare a blog page that is implemented in code rather than in the database.
 * Call this from the module that registers the route, so the URL can never
 * drift out of sync with the code that serves it.
 */
export function registerCodeOwnedBlogSlug(slug: string): void {
  codeOwnedSlugs.add(normalise(slug));
}

/** Replace the cached database slugs. Called once during route registration. */
export function primeBlogSlugCache(slugs: string[]): void {
  dbSlugs = new Set(slugs.map(normalise));
}

/** Mark a slug as live immediately after a post is created or renamed. */
export function noteBlogSlugAdded(slug: string): void {
  dbSlugs.add(normalise(slug));
}

/** Drop a slug from the protected set after a post is deleted. */
export function noteBlogSlugRemoved(slug: string): void {
  dbSlugs.delete(normalise(slug));
}

/** True when the slug is a real page — code-owned or database-backed. */
export function isKnownBlogSlug(slug: string): boolean {
  const key = normalise(slug);
  return codeOwnedSlugs.has(key) || dbSlugs.has(key);
}

/** Every known slug. Used for the /<slug> → /blog/<slug> legacy redirects. */
export function getKnownBlogSlugs(): string[] {
  return [...new Set([...codeOwnedSlugs, ...dbSlugs])];
}

export function getRegistryCounts(): { codeOwned: number; database: number } {
  return { codeOwned: codeOwnedSlugs.size, database: dbSlugs.size };
}

/**
 * Extract the slug from a /blog/<slug> pathname, or null if the path is not a
 * single-segment blog URL.
 *
 * Always pass `req.originalUrl` (minus the query string), never `req.path`:
 * inside a mounted middleware `req.path` is rewritten relative to the mount
 * point and reports "/" for every request.
 */
export function blogSlugFromPath(pathname: string): string | null {
  const clean = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const match = /^\/blog\/([^/]+)$/i.exec(clean);
  if (!match) return null;
  const slug = normalise(decodeURIComponent(match[1]));
  // Asset requests that happen to sit under /blog/ are not pages.
  if (/\.\w+$/.test(slug)) return null;
  return slug || null;
}

/** True when this request targets a blog page we deliberately built. */
export function isProtectedBlogPath(pathname: string): boolean {
  const slug = blogSlugFromPath(pathname);
  return slug !== null && isKnownBlogSlug(slug);
}

/**
 * Build the router that all legacy WordPress redirects must be registered on.
 *
 * The first middleware inspects the incoming URL and, when it points at a
 * registered blog page, calls `next("router")`. That exits this router
 * immediately and hands control back to the main app, so NONE of the redirect
 * rules inside can run. This is a structural guarantee rather than a
 * convention: a future redirect rule added here — however broad, however
 * accidentally case-insensitive — physically cannot fire on a real blog URL.
 *
 * Registering the rules directly on `app` is what allowed a legacy rule to
 * hijack a live page, so redirects belong on this router and nowhere else.
 */
export function createLegacyRedirectRouter(): Router {
  const router = Router();
  router.use((req, _res, next) => {
    // req.originalUrl is required here: within a mounted router req.path is
    // rewritten relative to the mount point and cannot be trusted.
    if (isProtectedBlogPath(req.originalUrl)) return next("router");
    next();
  });
  return router;
}
