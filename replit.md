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