# Rainbow International School Website

## Overview

A full-stack replication of the Rainbow International School website, a CBSE-affiliated school. The project aims to provide a comprehensive online presence with a focus on SEO, user experience, and robust backend functionality. It includes features like dynamic content rendering, admission processes, and brand partnerships, mirroring the school's real-world operations and marketing efforts.

## User Preferences

Preferred communication style: Simple, everyday language.

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