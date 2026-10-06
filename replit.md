# Rainbow International School Website

## Overview

A full-stack replication of the Rainbow International School website, a CBSE-affiliated school. The project aims to provide a comprehensive online presence with a focus on SEO, user experience, and robust backend functionality. It includes features like dynamic content rendering, admission processes, and brand partnerships, mirroring the school's real-world operations and marketing efforts.

## User Preferences

Preferred communication style: Simple, everyday language.

**Project conventions:**
- Anytime a new dashboard is created or a dashboard passcode is changed, the `/internal` staff directory page (`client/src/pages/Internal.tsx`) MUST be updated in the same change — name, URL/slug, passcode, and description. This is not optional.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **Styling**: Tailwind CSS v4 with custom theming, utilizing shadcn/ui components (New York style) built on Radix UI.
- **State Management**: TanStack React Query for server state.
- **Form Handling**: React Hook Form with Zod validation.
- **Typography**: Inter (body/UI) and DM Sans (headings).
- **SEO**: Dynamic `<head>` meta tags, JSON-LD structured data, `llms.txt`, `sitemap.xml`, semantic HTML, and image optimization (lazy loading, async decoding, explicit dimensions).
- **Content Design**: JIS-inspired aesthetic with a deep navy primary and amber/yellow accent, rounded corners, and editorial layouts. Navbar is sticky, transparent on homepage, and solid white on inner pages.

### Backend
- **Runtime**: Node.js with Express.js (TypeScript, ESM modules).
- **API Design**: RESTful JSON API endpoints under `/api/*`.
- **Database ORM**: Drizzle ORM with PostgreSQL dialect, using Zod for schema validation generated from Drizzle schemas.
- **Server-Side Rendering (SSR)**:
  - All 94 blog posts (`/blog/:slug`) are SSR via `server/ssrBlog.ts` for pre-rendered HTML.
  - Home page (`/`) is SSR for search engine bots via `server/ssrHome.ts`, providing a fully pre-rendered HTML page with structured data and meta tags.
- **Specific Features**:
  - **Career Page**: Handles job applications with resume uploads, server-side validation, persistence to `career_applications` table, and email notifications to HR.
  - **Brand Partners Page**: Lists 134 partner brands across 11 categories with filter pills and a brochure download modal. Brochure download requests are persisted as leads in `brochure_requests` table.
  - **Marketing JSON Export**: `GET /api/marketing/export` provides a token-protected JSON export of marketing data for external analysis.

### Build System
- **Development**: Vite for frontend (HMR), tsx for backend.
- **Production**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`.
- **Path Aliases**: `@/*` for client, `@shared/*` for shared code, `@assets` for assets.

### Project Structure
- `client/`: Frontend React application (components, pages, hooks, lib).
- `server/`: Backend Express application (entry, routes, SSR logic, database operations).
- `shared/`: Code shared between frontend and backend (Drizzle schemas, Zod types).
- `migrations/`: Database migrations.

## Google Sheets One-Way Mirror (AY 2027-28)

Leads captured via the walk-in kiosk are automatically mirrored to two locked Google Sheets — one per brand — so the team can view live data in Sheets without editing it. The DB is the source of truth; the sheet is read-only.

### Required environment variables
| Secret name | Description |
|---|---|
| `RIS_WALKIN_SHEET_ID_2728` | Google Sheets ID for "RIS Walk-in Enquiries 2027-2028" |
| `RPS_WALKIN_SHEET_ID_2728` | Google Sheets ID for "RPS Walk-in Enquiries 2027-2028" |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 refresh token (already used by Search Console integration) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID (already set) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret (already set) |

### One-time setup steps

1. **Create the two Google Sheets manually** in the team Google account:
   - "RIS Walk-in Enquiries 2027-2028"
   - "RPS Walk-in Enquiries 2027-2028"

2. **Get the Sheet IDs** from each sheet's URL:
   `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
   Copy the `<SHEET_ID>` portion (long alphanumeric string).

3. **Share both sheets** with the Google OAuth account used for this app (the one whose `GOOGLE_REFRESH_TOKEN` is stored). Give it **Editor** access.

4. **Create a "Leads" tab** in each sheet (or rename the first tab to "Leads").
   The header row will be written automatically on the first resync.

5. **Add the env vars** to Replit Secrets:
   - `RIS_WALKIN_SHEET_ID_2728` → the RIS sheet ID from step 2
   - `RPS_WALKIN_SHEET_ID_2728` → the RPS sheet ID from step 2

6. **Trigger the initial resync** via the admin panel or directly:
   ```
   POST /api/walkin/sheets/resync?brand=RIS   (with X-Api-Key: <ADMIN_TOKEN>)
   POST /api/walkin/sheets/resync?brand=RPS
   ```

7. **Lock the header row** in each sheet (select row 1 → Data → Protect range) to prevent accidental edits.

### How sync works after setup
- Every new lead and every lead update automatically queues a sheet upsert (fire-and-forget; never blocks the API).
- The admin panel shows last-sync timestamp and DB vs sheet lead counts (`GET /api/walkin/sheets/status`).
- If the sheet is corrupted, use "Re-sync all" to rewrite it from the DB.

## Large File Uploads & Publishing Size Limit

Replit publishing fails with **"image size is over the limit of 8 GiB"** when the total workspace disk usage (all files, not just Git-tracked ones) exceeds 8 GiB. `.gitignore` and `git rm --cached` do **not** help because the image builder scans the full workspace, not the Git tree.

### Check before publishing

```bash
npm run disk:check
```

This reports the top-10 largest directories and warns when total size crosses **6 GiB** — giving 2 GiB of headroom before the hard limit. Run it before every publish if the workspace has grown recently.

### Where `attached_assets/` grows

Every file uploaded to the Replit chat is auto-saved into `attached_assets/`. It currently holds ~612 MB of images and videos that are actively served by the app and must stay. However, ad-hoc reference images, design screenshots, and other one-off uploads that are **not** served by the app should be kept out of this directory.

### What to do instead of uploading large files to the chat

| Scenario | Recommended approach |
|---|---|
| Reference images / design mockups (not served) | Upload to an external host (Google Drive, Dropbox) and share a link |
| Videos served by the app | Use Replit Object Storage — upload via the Object Storage panel, then reference the public URL in code |
| Logos / icons / images served by the app | Keep in `attached_assets/` but remove originals after optimising (use WebP, compress) |

### If the workspace is already over 6 GiB

1. Run `npm run disk:check` to see which directories are largest.
2. Remove non-served files from `attached_assets/` (verify nothing in `server/` or `client/` imports them first).
3. Move large served files (videos, hi-res images) to Replit Object Storage and update the references.
4. Re-run `npm run disk:check` until it shows ✅ before publishing.

## RIS Instagram scheduled job

`scripts/ris-instagram-job.ts` is the separate RIS-only tracker entry point. It is **prepared but not scheduled yet**; the intended run is daily at **9:00 AM IST** with one retry after 60 seconds on failure. Each attempt logs its date, result, and rows written in the scheduled deployment's Publishing logs. Once deployed, pause it by turning off its schedule in Publishing → Adjust settings. Leave the website's existing RIS timer active until the separate job is live, then set `RIS_INSTAGRAM_SCHEDULED_ONLY=true` for the website.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Type-safe ORM.
- **Drizzle Kit**: Migration tooling.

### Key NPM Packages
- `@tanstack/react-query`: Server state management.
- `drizzle-orm` + `drizzle-zod`: ORM and schema validation.
- `express`: HTTP server framework.
- `zod`: Runtime type validation.
- `date-fns`: Date utilities.
- `sonner`: Toast notifications.

### Development Tools
- **Vite**: Frontend build tool.
- **tsx**: TypeScript execution for dev server.
- **esbuild**: Production server bundling.
- `@replit/vite-plugin-*`: Replit-specific plugins.

## SEO WORK RULES (Rainbow International School)
1. Design freeze: only text, order of text, links, metadata and schema may change unless the owner asks for a redesign. Never change classes, colours, spacing, images, fonts or layout.
2. Never take or send screenshots. Never run Lighthouse. Never submit test enquiries or create test leads.
3. Never publish/deploy. The owner publishes.
4. Verified facts only:
   - Rainbow International School, Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra 400607
   - Phone: +91 82915 68972 is the main admissions number (header, buttons, forms, copy). School landline (022) 6910 5000 appears in the footer only. No other numbers.
   - Email admin@rainbowinternationalschool.in (only email)
   - Office Mon–Sat 9 am–6 pm. Founded April 2009. CBSE Affiliation No. 1130661, School Code 30562
   - 2027–28 classes: KG (Jr KG, Sr KG) to Class 12. No Nursery. Class 11–12: Science, Commerce, Humanities
   - Ages: Jr KG 3.5–4.5, Sr KG 4.5–5.5, Class 1 minimum 6 (6–7), then one-year steps
   - Timings: KG 9:30 am–12:30 pm; Class 1–10 7:30 am–1:00 pm; Class 11–12 1:00–6:00 pm
   - Spanish KG to Grade 8. In-house GPS-enabled buses for homes within 10 km
   - Facilities: 3.5-acre campus, swimming pool, amphitheatre, sports facilities, organic garden, AC classrooms, smart boards, CCTV, Physics/Chemistry/Biology/IT/Maths labs, 100% female staff
   - 3,000+ students. 100% Class 10 result in 2018-19. No entrance test for KG to Class 8
   - Fees are never shown on the site: "call or WhatsApp +91 82915 68972"
5. Banned about RIS: best, top, No. 1, number one, leading, trusted, premier, finest, world-class, guaranteed, "seats filling", "limited seats", "almost full", "hurry". "best" may appear only inside a parent's quoted review or inside a question a parent would type (e.g. "Which is the best CBSE school in Thane for my child?").
   Exception: a real award name may contain 'Best' (e.g. 'Best Dynamic School 2026').
6. Only the 2027–28 admissions year. Never mix RIS with Rainbow Preschool (RPS) content.
7. Bot/visitor parity: page copy lives in shared/content/<page>.ts and is imported by BOTH the React page and the server SSR renderer. Never type the same sentence twice.
8. Never touch: /leads, /admin/*, /walkin*, /sales*, /rps-sales*, /marketing*, /alliances*, /overview-27-28, /internal, /mcp, /api/*, CRM code, form submit handlers, analytics event names.
9. Checks per prompt: `npx tsc --noEmit` and `npm run parity:check` for the changed routes only. Nothing else.
10. Finish with one git commit and one push. Write a short report to artifacts/reports/.