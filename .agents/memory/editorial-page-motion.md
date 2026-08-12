---
name: Motion and 3D on SEO editorial pages
description: Why RIS blog article pages use hand-rolled canvas rather than three.js, and the non-negotiable fallbacks for scroll-driven reveals.
---

## Rule

On SSR blog/article pages that exist to rank in search, do not pull in a 3D engine
(three.js, Babylon) for ambient background effects. A few dozen drifting points with
proximity lines is ~2KB of hand-written `<canvas>`; three.js is ~600KB.

**Why:** these pages are judged on LCP and Core Web Vitals. A 600KB parse cost buys
nothing visually at that fidelity, and the article is the product — not the effect.
Reserve real 3D for pages where the geometry itself is the content.

## Non-negotiable fallbacks for scroll-driven reveals

Any "fade in as it enters the viewport" pattern hides content by default in CSS, which
means three ways to lose the article entirely:

1. **No `IntersectionObserver`** — feature-detect and mark everything visible up front.
2. **`prefers-reduced-motion: reduce`** — mark everything visible up front, disable the
   canvas loop, and drop all transitions. Do not merely shorten them.
3. **No JS at all** — put a `no-js` class on `<html>` and have the script remove it, so
   CSS can special-case the scriptless state (flip cards show both faces stacked,
   `[hidden]` tab panels are forced visible).

Also pause any `requestAnimationFrame` loop on `visibilitychange` and when its canvas
leaves the viewport, or it burns battery for the whole scroll.

## How to apply

Verify by fetching the page with `curl` (no JS executes) and asserting every section
heading, list item and FAQ string from the source record appears in the raw HTML. If
content only shows up after script runs, crawlers may not see it.
