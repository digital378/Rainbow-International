---
name: SSR blog routing architecture
description: How blog routes are served — all visitors get SSR HTML, not the React SPA; custom slugs need a dedicated Express route registered before registerSSRRoutes.
---

## Rule

`server/ssrBlog.ts` exports `registerSSRRoutes(app)` which registers `app.get("/blog/:slug", ...)` serving SSR HTML to **all** browsers — not just bots. The React SPA (BlogSpainArgentina or BlogPost) therefore never runs for any `/blog/` URL.

## How to apply

To create a blog post with rich custom HTML (tables, accordion, non-standard layout):

1. Create `server/ssrCustomSlug.ts` with a `renderPage()` function returning full HTML and a `registerCustomSlugSSR(app)` export.
2. Import and call it in `server/routes.ts` **before** `registerSSRRoutes(app)` (line ~327):
   ```ts
   registerSpainArgentinaSSR(app); // must come before registerSSRRoutes(app)
   registerSSRRoutes(app);
   ```
3. The specific Express route takes priority over the wildcard `/blog/:slug` route.

## Why

Express routes match in registration order. The wildcard `/blog/:slug` in `ssrBlog.ts` catches everything, so a more-specific slug must be registered first. Adding a route to `App.tsx` (React router) has no effect because the server never serves `index.html` for `/blog/*` — it always serves SSR HTML directly.

## Template reference

`server/ssrSpainArgentina.ts` is the canonical example of a custom SSR blog handler — it includes: Article + FAQPage + BreadcrumbList JSON-LD, TOC, callout boxes, tables, FAQ accordion with inline JS, full RIS navbar/footer (copied CSS from ssrBlog.ts), scroll progress bar, sidebar with match-details widget, CTA box, tags, and inline editorial NOTE comments for time-sensitive content.

## Second pattern: per-slug layout branch (no separate route)

When a slug keeps the *normal* `/blog/:slug` data flow but needs a different visual
layout, do not register a separate route — branch inside the existing renderer on an
opt-in slug set, and keep the `<head>` metadata, JSON-LD, navbar, contact strip and
footer in one shared module that both layouts import.

**Why:** duplicating the chrome is how the SEO surface silently drifts between layouts —
one copy gets a canonical fix and the other does not. A shared module makes drift
impossible, and an opt-in set means every unlisted post is provably untouched.

**How to verify a layout change did not leak:** capture `curl` output for a few other
slugs before the change and `diff` after — they must be byte-identical. Then diff the
changed page's own `<head>` meta tags and JSON-LD blocks against its own "before"
capture; those must be byte-identical too, even though the body changed completely.
