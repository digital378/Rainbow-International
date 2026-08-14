# Raksha Bandhan 2026 Blog Page — Design Specification

## Purpose

Create a new, search-ready Rainbow International School blog page at
`/blog/raksha-bandhan-2026`. The page combines a cinematic Raksha Bandhan story
with practical, age-appropriate material parents and students can use: speeches,
an essay, ten lines, activities, wishes, FAQs, and a printable handout.

The page must be a separate article. It must not change or replace the existing
Spain–Argentina World Cup blog.

## Audience and voice

The primary audiences are CBSE students and their parents in and around Thane,
with a secondary audience of teachers looking for classroom-ready festival
resources. Copy will be warm, clear, respectful, and school-appropriate. It
will not make unsupported claims about Rainbow International School, its
facilities, events, awards, or results.

## Route, SEO, and server rendering

- Add a dedicated SSR handler before the catch-all blog SSR registration so all
  visitors receive complete HTML at `/blog/raksha-bandhan-2026`.
- Use canonical URL
  `https://rainbowinternationalschool.in/blog/raksha-bandhan-2026`.
- Use the title: `Raksha Bandhan 2026: Date, Speech, Essay & Activities for Students | Rainbow International School`.
- Use a concise meta description that includes 28 August 2026, speeches, essay,
  ten lines, activities for children, and wishes.
- Include Open Graph and Twitter-card metadata, using a locally served 1200×630
  navy-and-gold OG image that carries the page title.
- Include Article, FAQPage, and BreadcrumbList JSON-LD. The FAQ schema must
  match the visible FAQ questions and answers exactly.
- Make all substantive copy part of the first server response. The 3D experience
  is an enhancement and must never be the only source of page content.
- Keep the SSR page as the single source of truth for this route. Direct
  navigation, refreshes, and internal links must all use the server-rendered
  article rather than a competing SPA version.

## Content architecture

The page will use one H1, `Raksha Bandhan 2026: The Thread That Binds Us`, then
follow a logical H2/H3 hierarchy:

1. Hero with the date: Friday, 28 August 2026, Shravana Purnima.
2. Three short narrative chapters: the thread’s meaning; the words *raksha* and
   *bandhan*; and values of care, friendship, and mentorship in school life.
3. `When Is Raksha Bandhan 2026? Date & Significance`, including an elegant date
   card and a note to confirm the local auspicious timing.
4. `The Story of Raksha Bandhan for Kids`, covering Krishna and Draupadi, Yama
   and Yamuna, and Rani Karnavati and Humayun as traditional legends.
5. `Raksha Bandhan Speech in English for Students`, with a complete one-minute
   primary-school speech and a complete two-to-three-minute secondary-school
   speech.
6. `Raksha Bandhan Essay & 10 Lines`, including a roughly 300-word essay and a
   simple ten-line list.
7. `Rakhi Making Ideas & Activities for Kids`, with clear steps for five
   activities: paper quilling rakhi, thread-and-bead rakhi, promise cards,
   gratitude circle, and sweets made together.
8. `Raksha Bandhan Wishes & Messages`, with twelve short copyable messages for
   siblings and friends.
9. A printable speech-and-essay PDF download.
10. A six-question FAQ, closing wishes, school CTA buttons, and the illustrative
    artwork disclaimer from the supplied brief.

Keyword phrases from the supplied brief will appear naturally in relevant
headings and copy, not as repeated or hidden keyword blocks.

## Visual direction

The visual language is a refined festive editorial treatment:

- Deep navy `#10174F` is the dominant canvas; white and warm cream `#FFF6E8`
  keep long-form reading bright and legible.
- Gold `#F5B428` and saffron `#FF8A3D` appear only as measured accents:
  dividers, icon rings, progress thread, buttons, and rakhi details.
- Headings use Playfair Display and body text uses Poppins, with a readable
  maximum measure of about 65 characters.
- Use the official RIS logo only if a source asset is present. It must never be
  recoloured, redrawn, stretched, or cropped. Until then, use a restrained
  text-based school name rather than fabricating a logo.
- Use Lucide line icons throughout the page—such as CalendarDays, BookOpen,
  PenLine, HeartHandshake, Scissors, Download, MessageCircle, and ArrowDown.
  No emoji characters are used for interface controls, list markers, labels, or
  decorative signposts.

## Full cinematic 3D experience

The top narrative section includes a fixed Three.js canvas with a custom,
procedural rakhi: a gold ring, red medallion, bead details, and silk threads.
It travels on a camera-controlled scroll path opposite each narrative chapter.
Gold particles and warm diya-like lights add atmosphere without covering text.

The interactive “Tie a Rakhi of Your Own” card will:

- render the rakhi in a focused scene,
- support pointer drag rotation and keyboard-accessible theme selection,
- offer four color themes,
- reveal a restrained knot-and-wish animation after the action button is used,
- expose a text equivalent and remain usable when WebGL is unavailable.

A slim vertical thread indicator follows reading progress through the cinematic
section. A festive divider cleanly transitions to the bright editorial library.

## Performance, accessibility, and resilience

- Use the existing Three.js and React Three Fiber dependencies; do not add a
  second 3D stack.
- Defer scene initialization until after initial HTML and hero content are
  painted. The hero text remains the intended LCP element.
- Cap device pixel ratio at two, reduce particle count on smaller screens, stop
  rendering in hidden tabs, and clean up listeners and animation frames.
- Respect `prefers-reduced-motion`: use the static art composition and avoid
  scroll-driven camera movement and celebratory animation.
- Provide a static CSS/SVG rakhi composition if WebGL, reduced motion, or low
  capability prevents the 3D scene from loading.
- Maintain keyboard navigation, visible focus states, semantic landmarks, a
  logical heading order, descriptive alt text, and WCAG AA contrast.
- No decorative emoji should appear in the new article’s rendered text.

## Printable PDF

The client will generate a clean printable PDF from the visible speech and essay
content. It uses RIS navy, white, and gold accents, carries the official logo
only when available, and otherwise uses the same restrained text identity.
The download must work without a backend and must not contain hidden or
invented school details.

## Validation

Before delivery:

1. Verify direct SSR navigation, metadata, canonical link, and all three JSON-LD
   blocks.
2. Verify the 3D scene and its static fallback at desktop and 390px mobile
   widths, including reduced-motion behavior and the interactive card.
3. Verify that the speeches, essay, ten lines, activities, wishes, FAQs, and
   printable PDF are present and usable.
4. Confirm no emojis render on the new page, Lucide icon labels remain
   accessible, there is no horizontal overflow, and browser console logs are
   clean.
5. Run the project’s existing automated type/build checks and browser tests.