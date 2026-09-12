# Ganesh Chaturthi Blog Enhancements

## Scope

Update the existing Ganesh Chaturthi 2026 article without changing its canonical URL, crawlable content, metadata, or visual theme.

## Navigation

Replace the horizontal quick-link strip with a Janmashtami-style article layout. Desktop uses a sticky left table of contents. At widths up to 1050px, the same links become an accessible “On this Page” disclosure above the article. Scroll position highlights the active section.

## Quiz

Replace reveal-only cards with 15 multiple-choice questions. Each question has four options, locks after one selection, marks the correct answer, gives immediate feedback, updates the score, and supports a complete reset.

## Gallery and download counts

All preview holders remain square at every viewport. A single public GET endpoint returns shared counts for the ten allow-listed assets. A public POST endpoint atomically increments one allow-listed asset using PostgreSQL upsert. The page fetches counts once and updates the clicked count after download begins.

## Closing sections

Adapt the Janmashtami two-card Explore section and full-width closing CTA to the Ganesh manuscript theme. The Rainbow Preschool International card keeps its existing links and adds Homepage, Playgroup, Nursery, and Kindergarten; its wrapping layout must preserve card alignment. Rename the gallery and caption headings exactly as requested.

## Reliability and accessibility

The API rejects unknown asset IDs. Database increments are atomic. Navigation, quiz choices, and mobile disclosure use native buttons and ARIA state. Reduced-motion behavior remains intact. The existing canonical URL, schema, and FAQ content are unchanged.

## Verification

Run the TypeScript check, validate JSON-LD, exercise counter GET/POST, verify all local assets, and inspect desktop/mobile rendering and the MCQ flow in a browser.