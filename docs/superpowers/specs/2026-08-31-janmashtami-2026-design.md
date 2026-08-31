# RIS Janmashtami 2026 Blog Design Specification

**Date:** 2026-08-31  
**Status:** Approved design; awaiting written-spec review  
**Route:** `/blog/janmashtami-2026`  
**Visual direction:** B — Midnight festival journal

## Goal

Create a complete, self-contained Krishna Janmashtami 2026 resource for Rainbow
International School. It will serve CBSE students, parents, teachers, and
school social-media users with crawlable cultural content, ready-to-use essays
and speeches, classroom activities, a quiz, FAQs, and ten downloadable social
images.

The page must be materially distinct from the Rainbow Preschools article. It
must not share a canonical, `hreflang`, logo lockup, or duplicate-content
relationship with that page.

## Architecture

- Add a static HTML page at `blog-pages/janmashtami-2026/index.html`.
- Register `/blog/janmashtami-2026` before the generic SSR blog route using the
  existing `express.static(..., { redirect: false })` pattern and a direct
  `sendFile` handler for the slashless URL.
- Add one entry to `shared/codeOwnedBlogs.ts`. This single manifest entry gives
  the page redirect protection and a `/blogs` listing card.
- Keep the existing build copy of `blog-pages/` so the route works from both
  the project root in development and `dist/` in production.
- Put generated images in
  `client/public/blog-assets/janmashtami-2026/` and use root-absolute URLs.
  The existing `/blog-assets` Express static route will serve them in
  development and the Vite public build will serve them in production.
- Add the page URL to the project’s sitemap mechanism if it is not already
  derived from the code-owned registry.

## Visual system

The page uses a midnight editorial festival journal:

- Dominant navy: `#10174F`.
- Restrained warm gold/mustard accents, used for rules, labels, focus-visible
  treatment, highlights, and celebration details.
- High-contrast white and warm off-white reading surfaces.
- A characterful serif display face paired with a readable system sans stack;
  Devanagari text uses `"Noto Sans Devanagari", "Nirmala UI", sans-serif`
  fallbacks.
- Atmospheric radial light, subtle grain, constellation-like decoration, and
  layered cards provide depth without replacing the navy foundation.
- Mobile is the primary composition: compact hero, collapsible “On this page”
  rail, single-column reading flow, large tap targets, horizontal overflow only
  where the timeline benefits from it.
- Use the official RIS logo without stretching, recolouring, or cropping.
  Rainbow Preschools appears only as the exact text link requested in the
  footer section, never as a logo or red-branded block.

## Content and page structure

Render the full approved copy from the build prompt without rewriting,
shortening, or inventing facts. Preserve all Hindi and Marathi text exactly.
Use one H1 and the requested H2/H3 hierarchy for sections 1–20. The following
blocks are present in the initial HTML, not injected only by JavaScript:

1. Hero and byline for “Krishna Janmashtami 2026: Complete Guide to History,
   Significance, Speeches, Essays & School Activities”.
2. Four “At a Glance” date/time tiles.
3. Krishna introduction, history, significance, symbols, regional celebrations,
   and Dahi Handi/Gopalkala explanation.
4. Timeline table for the Krishna narrative.
5. English, Hindi, and Marathi essays and speeches.
6. Quotes, slogans, Bal Krishna stories, ten facts, and the complete 20-question
   quiz answer fallback.
7. Nine school activities, festive recipes, vrat guidance, wishes, and ten
   downloadable social graphics.
8. Ten exact FAQs, Explore Rainbow Schools content, CTAs, placeholders, and
   footer copy.

Bracketed contact placeholders remain visibly bracketed and are styled as
pending verification; no phone, address, email, or school claim is fabricated.

## Interactive behavior

Enhance the server-rendered HTML with one clearly scoped vanilla-JS function per
interaction family:

- Sticky, collapsible table of contents with all 20 content anchors and
  `IntersectionObserver` active-section state.
- Essay language tabs followed by available length tabs; every panel has
  “Copy Text” and a confirmation live region.
- Speech language tabs with “Copy Text”.
- Quote carousel with previous/next controls, five-to-six-second autoplay, and
  pause-on-hover/focus behavior; slogans are copyable chips grouped by language.
- Four swipeable/expandable story cards with visible moral lines.
- Ten tap-to-reveal fact cards that also expose their content to keyboard users.
- Single-question scored quiz with 15 main questions and an independent five
  question bonus round, instant feedback, live `0/15` and `0/5` counters, reset,
  and a shareable results sentence.
- Responsive activity cards and expandable recipe cards.
- Copy-caption controls for wishes and a social share bar for WhatsApp,
  Facebook, Instagram, and Copy Link.
- Ten gallery cards with descriptive alt text and direct “Download Free” links.
- Keyboard-accessible FAQ disclosure controls, with one or more answers open
  without hiding their text from crawlers.

The JavaScript is progressive enhancement: if it fails or is disabled, all
content remains readable and the essential links, tables, text, and FAQ answers
remain usable.

## Accessibility and performance

- Use semantic landmarks, headings, lists, tables, buttons, tabs, and
  disclosure controls.
- Keep interactive targets at least 44×44px, provide visible `:focus-visible`
  states, and maintain WCAG AA contrast.
- Tabs expose selected state and controlled-panel relationships. Accordions
  expose `aria-expanded` and `aria-controls`. Copy/status feedback uses a
  polite live region.
- Include meaningful alt text on every image. Below-the-fold images are lazy
  loaded; the primary hero/OG image is prioritized.
- Avoid layout shift with explicit image dimensions and stable card geometry.
- Use deferred inline enhancement code or a deferred script with no
  render-blocking third-party dependency.

## Image asset plan

Generate ten original, non-photorealistic 1080×1080 images in the listed order:

1. Bal Gopal silhouette with flute and sunrise gradient.
2. Peacock feather and crossed flute line art.
3. Stylised Dahi Handi human pyramid.
4. Matki with butter and diyas.
5. Bhagavad Gita and Sudarshan Chakra motif.
6. Yamuna, basket, and storm-night journey.
7. Mor Pankh close-up illustration.
8. Krishna and Sudama friendship illustration.
9. Blank RIS event announcement template.
10. Blank quote-card template.

Each uses navy as the base/accent, restrained gold and white typography,
generous safe-area padding, original artwork only, and a small tasteful RIS
watermark. The live page references optimized WebP assets with JPG fallbacks
where practical; each downloadable file is exactly 1080×1080px and targeted
below approximately 300 KB. Filenames follow
`janmashtami-2026-ris-<short-slug>`.

## SEO and structured data

Use these exact metadata values:

- Title: `Janmashtami 2026: Essays, Speeches & Activities | RIS`
- Description: `Complete Janmashtami 2026 guide for CBSE students — history, significance, essays & speeches in English, Hindi & Marathi, quiz, activities, free downloads. By Rainbow International School, Thane.`
- Canonical:
  `https://rainbowinternationalschool.in/blog/janmashtami-2026`
- Keywords and the H1/subheading/byline from the approved build prompt.

Include exactly the three requested JSON-LD blocks:

1. `BlogPosting`/`Article` with the exact H1, description, primary image,
   Rainbow International School organization author/publisher, publisher logo,
   `datePublished: 2026-08-31`, and `dateModified: 2026-08-31`.
2. `FAQPage` built from the ten exact visible FAQ question/answer pairs.
3. `BreadcrumbList` for Home → Blog → Janmashtami 2026.

Do not add `hreflang` tags or a canonical pointing to Rainbow Preschools. Link
to the RIS About Us and Admissions pages and include the requested normal text
link to the younger-siblings Rainbow Preschools article. External references,
if used, open in a new tab with `rel="noopener"`.

## Verification

Before completion:

- Run type/build checks and confirm the standalone page survives a production
  build.
- Confirm both `/blog/janmashtami-2026` and its asset URLs return successfully
  without a trailing-slash redirect loop.
- Check title, description, self-canonical, H1, JSON-LD types/count, robots
  directives, and sitemap inclusion.
- Capture desktop and mobile renders and confirm navy/gold visual hierarchy,
  readable Devanagari, stable image geometry, no horizontal page overflow, and
  no RPS logo or red branding.
- Exercise TOC, tabs, copy actions, carousel pause/control, story/fact reveals,
  both quiz rounds and reset, recipe/FAQ disclosures, share/copy-link controls,
  and all ten direct downloads.
- Inspect all ten generated images for 1080×1080 dimensions, file size,
  readable overlay text, descriptive filenames, and correct alt text.
- Run the focused browser test flow and resolve any console errors introduced by
  the page.
