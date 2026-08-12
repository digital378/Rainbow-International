# Design: Immersive redesign of /blog/ai-in-schools

Date: 2026-08-12
Status: Approved by user (Direction A — "Future Horizon")

## Goal

Turn the SSR-rendered article at `/blog/ai-in-schools` into an immersive, interactive
editorial experience for **parents choosing a future-ready school**, without changing
the article's content, its SEO surface, or the layout of any other blog post.

## Creative concept: "The Class of 2038"

A child entering Grade 1 today leaves school in 2038. The page is framed as a journey
along that timeline: the reader travels forward through the years as they scroll.
Deep navy night sky, amber and cyan accents, a timeline spine that fills as you read.

The concept is drawn directly from the article's own opening line, so it is editorial
rather than decorative.

## Scope

**In scope:** one slug only — `ai-in-schools`.

**Out of scope:** every other blog post, `client/src/pages/BlogPost.tsx`,
`shared/routeSeo.ts`, the sitemap, and the seed content itself.

## Architecture

`server/ssrBlog.ts` currently exports one renderer used for all slugs. It gains a
per-slug branch:

- `IMMERSIVE_SLUGS = new Set(["ai-in-schools"])`
- `renderBlogSSR(slug)` looks up the post, then dispatches to either
  `renderStandardArticle(post, related)` (the existing markup, unchanged) or
  `renderImmersiveArticle(post, related)`.
- The shared pieces — head/meta/schema block, top bar, navbar, contact strip, footer —
  are extracted into small helper functions used by both renderers, so there is exactly
  one copy of each.

The immersive renderer lives in its own module, `server/ssrBlogImmersive.ts`, so
`ssrBlog.ts` does not balloon. It exports:

```ts
export function renderImmersiveArticle(post: BlogPost, related: BlogPost[], parts: SharedParts): string
```

`SharedParts` carries the already-rendered head, topbar, navbar, contact strip and
footer strings so the two renderers cannot drift apart.

### Why not three.js

Three.js is ~600KB. This is a search-ranking article page; that cost would damage LCP
and Core Web Vitals for no visual gain at this scale. The hero constellation is a
hand-rolled `<canvas>` animation of roughly 2KB, inlined. No new runtime dependency.

## Content mapping

The interactive moments are built from content that already exists in the seed record —
nothing is invented, and no section is dropped.

| Article source | Becomes |
|---|---|
| `intro` | Hero framing + the 2026 → 2038 year marker |
| Section "Why AI Education Must Go Beyond Coding" `list` (5 items) | Future-skills meters that fill on scroll |
| Section "Where AI Can Be Dangerous" (4 bolded sub-points) | Flip cards: "AI says…" / "A thinking child asks…" |
| Section "Why CBSE Has Introduced Computational Thinking and AI" (4 pillars) | Four Pillars explorer — clickable panels |
| Section "How Schools Should Use AI Responsibly" `list` (8 items) | "Is your child's school future-ready?" tick-box self-check with a live score |
| All other sections | Timeline stations with scroll-reveal |
| `conclusion`, `RIS_BACKLINK`, tags, related, sidebar | Preserved, restyled to the dark theme |
| `faqs` | Rendered as an accordion (currently only emitted as schema, not visible) |

The flip-card fronts/backs and pillar examples are derived from the existing prose by a
small parser plus a static lookup table keyed on the sub-point heading. If a heading is
not found in the table, the section falls back to rendering as ordinary prose — the page
must never lose content because a parse missed.

## Data flow

Content flows one way: `storage.getBlogPostBySlug` → parse helpers → HTML string. No
client-side fetching, no hydration. All article text is present in the initial HTML
response, so crawlers and no-JS visitors get the complete article.

## Interaction layer

A single inlined `<script>` at the end of `<body>`:

- `IntersectionObserver` drives section reveals, meter fills, and timeline progress.
- Click handlers for flip cards, pillar panels, FAQ accordion, and the self-check.
- The year marker interpolates 2026 → 2038 against scroll position.

Rules:

- Every interactive element is a real `<button>` or `<details>` with correct ARIA state,
  keyboard-operable, visible focus ring.
- Flip cards show both faces stacked when JS is off (CSS `.no-js` fallback, `no-js` class
  removed by the script on load).
- `@media (prefers-reduced-motion: reduce)` disables the canvas loop, all transitions,
  and the parallax; content renders in its final state immediately.
- The canvas is `aria-hidden` and pauses via `IntersectionObserver` when off-screen.

## Error handling

- Renderer wrapped in try/catch at the route level (already present); on throw it calls
  `next()`, falling through to the SPA rather than serving a broken page.
- Parse helpers are total functions — they return the fallback prose rendering rather
  than throwing on unexpected input.
- The self-check and pillar explorer degrade to plain lists without JS.

## SEO invariants (must not regress)

- `<title>`, description, keywords, canonical, OG/Twitter tags: byte-identical.
- BlogPosting, BreadcrumbList and FAQPage JSON-LD: byte-identical.
- All article text present in the server response, not injected by script.
- Heading hierarchy preserved: one `h1`, section headings remain `h2`.
- Existing internal links, related links and tags all still rendered.

## Testing

1. **Regression:** capture `curl` output for three other slugs before and after the
   refactor; assert byte-identical.
2. **Content completeness:** assert every section heading, list item, FAQ question and
   internal link from the seed record appears in the rendered `ai-in-schools` HTML.
3. **SEO:** diff the `<head>` block and all three JSON-LD blocks against the pre-change
   capture; assert unchanged.
4. **Visual:** screenshot the page at desktop and mobile widths.
5. **No-JS:** fetch with curl and confirm the full article text is present.

## Cleanup

Delete `client/public/design-directions.html` (the temporary direction picker) once the
build is confirmed.
