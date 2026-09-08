# Ganesh Chaturthi Sacred Manuscript — Implementation Plan

## 1. Stabilise scrolling

- Audit the existing scroll listeners, observers, sticky elements, and broad CSS transitions.
- Remove any layout-affecting work performed continuously during scroll.
- Keep native scrolling and native smooth anchor navigation.
- Batch unavoidable scroll-linked progress and depth updates through one requestAnimationFrame loop.
- Disable decorative scroll effects on reduced-motion and constrained mobile layouts.

## 2. Establish the manuscript system

- Replace the current generic editorial override with a coherent tokenised visual system based on RIS navy, parchment, antique gold, saffron, and vermilion.
- Introduce display, body, mono-label, and Devanagari typography roles.
- Add lightweight inline-SVG/CSS manuscript motifs, grain, seals, arches, and chapter numerals.
- Keep all decorative layers non-semantic and non-interactive.

## 3. Recompose the article into five visual folios

- Preserve all existing semantic sections and text.
- Add visual grouping and chapter portals for Arrival, Story, Words, Learn & Celebrate, and Carry Forward.
- Alternate immersive chapter moments with calm reading canvases.
- Replace the long quick-link strip with a five-folio navigation model while retaining direct access to article sections.

## 4. Graduate premium interactions

- Restyle flip cards as opening folios.
- Turn the history sequence into a manuscript timeline.
- Give language tabs a leaf-changing transition.
- Add tactile states to quiz, FAQ, copy, and reveal controls.
- Reframe the wish-card generator as a festival atelier while preserving its canvas and download logic.
- Keep success feedback immediate and accessible.

## 5. Responsive and reduced-motion pass

- Preserve the full cinematic system on desktop.
- Reduce decorative density and sticky complexity on tablet.
- Use a single-flow mobile composition with simplified motion and compact chapter navigation.
- Ensure reduced-motion users see all content immediately without parallax, stagger, rotation, or confetti.

## 6. Verification

- Confirm all 22 sections, headings, schemas, metadata, and internal links remain present.
- Parse inline JavaScript and validate structured data.
- Run type checking, production build, and diff checks.
- Restart the app once.
- Verify scrolling, layout, and all existing interactions at 375, 768, and 1440 pixels.
- Check browser errors and capture representative screenshots.