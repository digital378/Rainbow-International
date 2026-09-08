# Ganesh Chaturthi 2026 — Sacred Manuscript Redesign

## Goal

Rebuild the existing Ganesh Chaturthi 2026 static article as a bold, cinematic, premium festival experience while preserving its crawlable content, multilingual resources, structured data, accessibility, and interactive learning tools.

The finished page should feel like opening a contemporary illuminated manuscript created by Rainbow International School: ceremonial and memorable at chapter boundaries, calm and highly readable within long-form sections.

## Success Criteria

- The page no longer feels like a uniformly styled article.
- Scrolling feels native, smooth, and responsive rather than sticky, delayed, or choppy.
- The visual journey has clear cinematic peaks and quiet reading intervals.
- All 22 existing content sections and their meaningful text remain available in static HTML.
- Existing countdown, progress, navigation, cards, quiz, FAQ, copy, multilingual, confetti, and wish-card behaviours remain functional.
- The design works at mobile, tablet, and desktop widths.
- Motion remains comfortable, performant, and optional.

## Experience Model

The article is organised visually into five folios:

1. **The Arrival** — hero, countdown, introduction, and key dates.
2. **The Story** — mythology, history, significance, symbolism, and traditions.
3. **Words for the Festival** — speeches, essays, multilingual tabs, and copy tools.
4. **Learn & Celebrate** — activities, eco-friendly guidance, facts, quiz, and FAQs.
5. **Carry the Blessing Forward** — wishes, image resources, wish-card generator, and school links.

This grouping is visual and navigational. It must not remove, hide from crawlers, or rewrite the semantic section structure required by the article.

Each folio starts with a cinematic chapter portal and then transitions to a calm reading canvas. The alternating rhythm prevents visual fatigue across the long page.

## Visual Direction

### Palette

- RIS midnight navy is the dominant environmental colour.
- Warm parchment is the primary reading surface.
- Antique gold provides fine structure and ceremonial detail.
- Saffron and restrained vermilion mark emphasis and interaction.
- Colour contrast must remain accessible in every state.

### Typography

- Use a distinctive high-contrast editorial serif for chapter portals and major display moments.
- Use a refined, highly legible sans serif for body copy and controls.
- Devanagari content must use a typeface designed for the script.
- Body measure, line-height, and size must prioritise sustained reading.

### Materials and Motifs

- Fine manuscript borders, embossed seals, arch forms, subtle paper grain, and line-drawn mandala geometry create the atmosphere.
- Decorative elements must support hierarchy rather than fill empty space.
- Avoid generic festival clip art, cartoon treatments, heavy gradients, and excessive floating ornaments.
- Until final artwork is supplied, imagery remains represented by elegant art-directed placeholders or CSS/SVG motifs.

## Layout and Section Rhythm

- Chapter portals may use full-width, near-viewport-height compositions.
- Reading sections return to a narrower, parchment-like content plane with generous vertical spacing.
- Selected sections may break the reading plane for timelines, symbolic objects, multilingual folios, interactive activities, and the wish-card studio.
- Section transitions should clearly communicate movement into a new folio.
- A slim chapter rail provides progress through the five folios and smooth anchor navigation.
- Mobile replaces the desktop rail with a compact, accessible chapter control.

## Motion System

### Scrolling

- Preserve native browser scrolling.
- Do not use scroll-jacking, forced wheel interpolation, or a synthetic smooth-scroll library.
- Anchor navigation may use native smooth scrolling.
- Eliminate broad CSS transitions or event handlers that cause layout work on every scroll frame.

### Cinematic Motion

- Use a small number of coordinated sequences at chapter portals.
- Decorative layers may move at subtly different depths, using requestAnimationFrame and transform-only updates where necessary.
- Reading sections should become mostly still after entry.
- Section reveals should be grouped and purposeful rather than applying independent fade-up effects to every element.
- Continuous ambient effects must pause when offscreen and must not run on constrained mobile devices.

### Interaction Feedback

- Symbol cards should open like manuscript folios.
- Timelines may draw or illuminate as they enter.
- Language switching should feel like changing a leaf while updating panels immediately.
- Quiz, FAQ, copy, flip-card, and wish-card controls need tactile pressed, selected, success, and focus states.
- Confetti should remain celebratory but brief and must respect reduced-motion preferences.

### Reduced Motion

With `prefers-reduced-motion: reduce`:

- Disable parallax, staggered entrances, decorative rotations, and confetti.
- Keep content visible without waiting for observers or animation completion.
- Retain instant state feedback and functional navigation.

## Existing Interaction Preservation

The redesign must retain:

- Festival countdown
- Reading progress indicator
- Scroll-aware chapter navigation
- Flip cards
- Quiz answer reveals and reveal-all
- FAQ accordion
- Speech and essay copy buttons
- English, Hindi, and Marathi tabs
- Wish-card canvas generation and download
- Existing contextual internal and external links

Controls may be restyled and regrouped, but their content and outcomes must not be lost.

## SEO, AEO, and GEO Preservation

- All meaningful article content remains present in the initial HTML response.
- Maintain one H1 and the existing meaningful H2 hierarchy.
- Preserve Article, BreadcrumbList, and FAQPage JSON-LD.
- Preserve canonical, social, and description metadata.
- Keep direct, answer-first explanations near relevant headings.
- Preserve descriptive internal-link anchor text.
- Interactive presentation must enhance visible content rather than becoming the only way to access it.

## Accessibility

- All controls must be keyboard operable.
- Focus indicators must be clearly visible against navy and parchment surfaces.
- Tabs, accordions, quizzes, and flip cards must expose correct state semantics.
- Decorative SVG and motif layers must be hidden from assistive technology.
- Text must not be embedded in decorative images.
- Touch targets should be at least 44 by 44 CSS pixels where practical.
- Fixed or sticky elements must not obscure focused content.

## Responsive Behaviour

### Desktop

- Full cinematic chapter portals, layered depth, and persistent chapter rail.
- Wider editorial compositions may break out from the central reading measure.

### Tablet

- Preserve chapter atmosphere while reducing decorative density and horizontal complexity.
- Avoid layouts that depend on hover.

### Mobile

- Use simplified, transform-light motion.
- Collapse chapter navigation into a compact control.
- Keep all reading and interactions in a single clear flow.
- Remove decorative layers that risk overflow or compete with text.
- Do not reproduce desktop parallax at reduced scale.

## Performance Constraints

- Do not introduce video backgrounds, WebGL, or a heavy scrolling framework.
- Prefer CSS and inline SVG for motifs.
- Animate transform and opacity rather than layout properties.
- Use IntersectionObserver for entry state and pause offscreen effects.
- Batch any scroll-linked visual updates through requestAnimationFrame.
- Avoid adding render-blocking dependencies.
- Maintain a functional page when JavaScript is unavailable, except for explicitly interactive tools.

## Verification

Verify the completed page at 375, 768, and 1440 pixel widths:

- Native wheel, trackpad, touch, keyboard, and anchor scrolling feel responsive.
- No page-level horizontal overflow or sticky-element collision.
- Chapter transitions are cinematic without delaying access to content.
- Long-form body text remains comfortable to read.
- All preserved interactions work after the structural redesign.
- Reduced-motion mode shows all content and disables nonessential movement.
- Structured data parses and the raw response contains all meaningful content.
- Type checking, production build, and browser console checks pass.

## Out of Scope

- Replacing final Ganpati image placeholders before the user supplies artwork.
- Converting the static page to React or database-managed content.
- Changing the article URL, editorial meaning, or school brand identity.
- Adding video, audio, or WebGL experiences.