---
title: Spain vs Argentina immersive blog redesign
date: 2026-08-12
status: approved for implementation planning
scope: /blog/spain-vs-argentina-world-cup-2026-final-lessons only
---

# Spain vs Argentina: Matchday Learning Arena

## Goal

Redesign the Spain vs Argentina World Cup 2026 blog article as an immersive, three-dimensional editorial experience that brings together:

1. Stadium atmosphere for the opening experience.
2. Playful, interactive visual treatment for the article's learning moments.
3. Calm, high-quality editorial presentation for the long-form reading experience.

The result must feel distinctly Rainbow International School: confident, energetic, parent-friendly, and educational rather than like a sports-betting or fan site.

## Scope and boundaries

- Change only `/blog/spain-vs-argentina-world-cup-2026-final-lessons`.
- Keep all existing article copy, tables, FAQ content, links, navigation destinations, title, meta tags, canonical URL, and Article/FAQ/Breadcrumb structured data.
- Keep the route served by the existing dedicated Express SSR handler.
- Do not modify the general `/blog/:slug` renderer, React routes, shared navigation, or other blog pages.
- Do not introduce large image, video, font, or animation dependencies. The treatment must be CSS- and inline-SVG-led to avoid increasing the deployment image substantially.

## Visual system

### Brand palette

The page will use the existing Rainbow palette as its visual foundation:

- Deep navy (`#091a4f`) for atmosphere, section backdrops, and high-contrast text areas.
- Royal blue (`#0d3b86`) for primary structure, data emphasis, and editorial anchors.
- Warm orange (`#f97316`) for calls to action and energetic match moments.
- Gold (`#fbbf24` / `#f59e0b`) for highlighted figures, progress, and achievement moments.
- White and pale blue surfaces for comfortable article reading.

Spain/Argentina references may appear in restrained match cards and flags, but must not replace the Rainbow brand colour hierarchy.

### Opening: stadium immersion

The hero will become a layered stadium composition:

- Perspective pitch/grid, stadium-light glow, and subtle floating football-linework sit behind the content.
- The category, article title, metadata, byline, and freshness note retain clear contrast and remain the visual priority.
- A compact match card introduces Spain versus Argentina with depth through layered surfaces, shadows, and a restrained perspective transform.
- Decorative layers use CSS and inline SVG only; no remote or locally bundled hero image is required.

### Article: learning-world depth

The World Cup primer and learning sections will receive a richer treatment without changing their content:

- Key figures (48 teams, 12 groups, 104 matches, 16 cities) become compact metric cards with visual depth.
- Geography, maths, teamwork, and family-learning sections gain distinct but brand-consistent learning-station surfaces.
- Existing callouts, tables, facts, and match statistics become elevated panels with controlled borders, layered shadows, and clearer labels.
- The match-specific content is visually grouped into a scorecard-style arena, while retaining the same semantic headings and table data.

### Long-form editorial reading

- The reading column remains calm, high contrast, and comfortably sized.
- Section headings use an editorial hierarchy with small coloured markers and generous spacing.
- The sidebar gains a more intentional pinned-card treatment on wide screens, then returns to normal document flow on narrower screens.
- The final CTA becomes a depth-rich but accessible Rainbow admissions panel.

## Interaction and motion

All enhancements are progressive. The document is complete and readable before JavaScript executes.

- Scroll progress remains available as a subtle brand-colour indicator.
- Suitable learning cards and statistics reveal once as they enter the viewport.
- Count-up figures run once when visible.
- Match and selected callout cards can have a light pointer-driven tilt on fine-pointer devices only.
- Hero decorative layers can have a very small parallax response without moving the text content.
- FAQ accordions retain keyboard operation and update `aria-expanded`.
- Users who prefer reduced motion receive the full layout without transforms, parallax, auto-counting, or reveal animation.

No hover, scroll, or pointer effect is required to access article content or controls.

## Technical approach

- Update the dedicated SSR page template and its page-specific CSS only.
- Keep its existing `<head>` metadata and JSON-LD blocks byte-for-byte equivalent unless a strictly necessary correction is identified and reviewed separately.
- Use semantic HTML: `header`, `main`, `article`, `aside`, `nav`, headings, lists, tables, and buttons remain intact.
- Keep all internal links as standard `<a href>` elements and external links with their existing `target` and `rel` protections.
- Add only small, page-scoped JavaScript for optional interactive effects. It must guard feature support and reduced-motion preferences.
- Use responsive breakpoints to reduce decorative layers and perspective effects at tablet widths, then simplify fully to a single-column editorial layout on mobile.

## Accessibility and performance requirements

- Retain logical heading order, readable contrast, visible keyboard focus, and semantic table structure.
- Do not create horizontal page overflow at any viewport width.
- Do not hide content until script execution. Animation classes must be added by JavaScript, not baked into initial content markup.
- Respect `prefers-reduced-motion: reduce`.
- Avoid large raster assets and continuous animation loops.
- Keep initial render server-side and functional with JavaScript disabled.

## Validation

Before delivery:

1. Build the application successfully.
2. Load the target SSR URL and verify its custom Express renderer is still used.
3. Compare the target page's title, meta description, canonical tag, and three JSON-LD blocks with their pre-change values.
4. Capture desktop and mobile screenshots to check the hero, reading layout, sidebar, FAQ, CTA, and absence of horizontal overflow.
5. Verify FAQ keyboard/click behavior and reduced-motion behaviour.
6. Confirm a representative normal `/blog/:slug` page remains unchanged.