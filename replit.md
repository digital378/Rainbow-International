# Rainbow International School Website

## Overview

A full-stack replication of the Rainbow International School website (rainbowinternationalschool.in) — a CBSE-affiliated school in Thane, Maharashtra. Built with React frontend, Express.js backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **Styling**: Tailwind CSS v4 with custom theme configuration and CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers
- **Fonts**: Inter (body/UI) and DM Sans (headings) from Google Fonts — JIS-inspired redesign

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful JSON API endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Blog SSR**: All 94 blog posts at `/blog/:slug` are Server-Side Rendered via `server/ssrBlog.ts` — Express intercepts before Vite/React, returns complete pre-rendered HTML. Demo route with badge at `/ssr-demo/blog/:slug`.
- **Home SSR**: Home page (`/`) is Server-Side Rendered for search-engine bots via `server/ssrHome.ts`. Bot user-agents (Googlebot, Bingbot, etc.) receive a fully pre-rendered ~58KB HTML page with all content (Hero, Awards, Features, About, Academics, Pedagogy, Discover, Beyond Classroom, Testimonials, Contact), structured data (Schema.org School), OG/Twitter meta tags, and inline CSS. Regular browser visitors still get the React SPA with full interactivity.

### Build System
- **Development**: Vite dev server with HMR for frontend, tsx for backend
- **Production Build**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Path Aliases**: `@/*` maps to client source, `@shared/*` maps to shared code, `@assets` maps to attached assets


### Project Structure
```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui base components
│   │   │   ├── home/        # Home page sections (Hero, Features, ContactForm, etc.)
│   │   │   └── layout/      # Navbar, Footer, PageBanner, SEO
│   │   ├── pages/           # All page components (18 pages)
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and query client
├── server/           # Backend Express application
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── ssrHome.ts    # Home page SSR for bots (SEO)
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared code between frontend and backend
│   └── schema.ts     # Drizzle schema definitions and Zod types
└── migrations/       # Database migrations (Drizzle Kit)
```

## Blog Posts (94 total)

All 94 blog posts are built as individual SEO-optimised pages at `/blog/:slug`. Post data lives in `client/src/data/blogPosts.ts`. Each post has: unique focus keyword, elaborated content (intro + H2 sections + conclusion), 5 internal links to RIS pages, related slugs, and an RPS sidebar block. Categories covered: CBSE School, Parenting, Sports, Study Skills, Awards, Health, Safety & Security, Student Achievements, Beyond the Classroom, School Selection, About Rainbow, Events, Early Education, Teen Development.

### SEO Blog Batch (Apr 2026 — 8 posts)
- CBSE vs ICSE vs State Board comparison (School Selection)
- School Admission Checklist Thane 2026-27 (CBSE School)
- How to Help Your Child Focus Better (Parenting)
- Importance of Extracurricular Activities (Parenting)
- NEP 2020 Explained for Parents (CBSE School)
- Prepare Your Child for First Day of School (Parenting)
- Multiple Intelligence-Based Learning (CBSE School)
- Best CBSE Schools in Thane — Selection Guide (School Selection)

Blog thumbnail component: `client/src/components/home/BlogThumb.tsx` — 3-tier fallback: CDN image → category image (`/blog/cat-*.png`) → gradient placeholder. Category images stored in `client/public/blog/`.

## Pages (24 total)

| Route | Page | File |
|-------|------|------|
| `/` | Home | `pages/Home.tsx` |
| `/about-rainbow-international-school` | About | `pages/About.tsx` |
| `/pre-primary-school-thane` | Pre-Primary | `pages/PrePrimary.tsx` |
| `/primary-section` | Primary (Class 1–5) | `pages/Primary.tsx` |
| `/middle-school-section` | Middle School (Class 6–10) | `pages/MiddleSchool.tsx` |
| `/secondary-section` | Secondary (Class 9–10) | `pages/Secondary.tsx` |
| `/senior-secondary-section` | Senior Secondary (Class 11–12) | `pages/SeniorSecondary.tsx` |
| `/amenities` | Amenities & Facilities | `pages/Amenities.tsx` |
| `/awards-achievements` | Awards | `pages/Awards.tsx` |
| `/student-achievements` | Student Achievements | `pages/StudentAchievements.tsx` |
| `/safety-security` | Safety & Security | `pages/SafetySecurity.tsx` |
| `/beyond-the-classroom` | Beyond Classroom | `pages/BeyondClassroom.tsx` |
| `/extracurriculars` | Extracurriculars | `pages/Extracurriculars.tsx` |
| `/photo-gallery` | Photo Gallery | `pages/PhotoGallery.tsx` |
| `/contact-us` | Contact Us | `pages/ContactUs.tsx` |
| `/academic-calendar` | Academic Calendar | `pages/AcademicCalendar.tsx` |
| `/blogs` | Blogs | `pages/Blogs.tsx` |
| `/cbse-mandatory-public-disclosures` | CBSE Disclosures | `pages/CbseDisclosures.tsx` |
| `/declaration` | Declaration (PDF embed) | `pages/Declaration.tsx` |
| `/book-list` | Book List (PDF embed) | `pages/BookList.tsx` |
| `/school-readiness-quiz` | School Readiness Quiz | `pages/SchoolReadinessQuiz.tsx` |
| `/top-schools-in-thane` | Top Schools Comparison | `pages/TopSchools.tsx` |
| `/testimonials` | Parent Testimonials | `pages/Testimonials.tsx` |
| `/faqs` | FAQ Hub | `pages/FAQs.tsx` |
| `/admissions` | Admissions 2026-27 | `pages/Admissions.tsx` |
| `/fee-structure` | Fee Structure | `pages/Fees.tsx` |
| `/school-near-brahmand-thane` | Locality: Brahmand | `pages/SchoolNearBrahmand.tsx` |
| `/school-near-ghodbunder-road-thane` | Locality: GB Road | `pages/SchoolNearGhodbunderRoad.tsx` |
| `/school-near-manpada-thane` | Locality: Manpada | `pages/SchoolNearManpada.tsx` |
| `/marketing` | Marketing Dashboard (noindex, real CRM/branch data) | `pages/Marketing.tsx` |

## Key Components

- **ScrollProgress.tsx** — Rainbow-gradient fixed scroll progress bar (3px, top of page, fills as user scrolls)
- **SEO.tsx** — Dynamic `<head>` meta tag manager for per-page SEO with JSON-LD structured data and BreadcrumbList support
- **PageBanner.tsx** — Hero banner with title, subtitle, and breadcrumb for inner pages
- **Navbar.tsx** — Sticky navbar with top bar (phone/email), dropdown menus for Academics and Explore, mobile menu
- **Footer.tsx** — 4-column footer with logo, links, explore, and contact info

## Content Design

- **Design**: JIS-inspired "Premium International School" aesthetic — deep navy (#091a4f) primary + amber/yellow (#fbbf24) accent; rounded/curved corners (16px cards, 12px icons, full-round buttons/pills); Inter + DM Sans typography; editorial layout with generous whitespace
- **Navbar**: Fixed position, transparent with white text on homepage (Oberoi-style overlay on hero), solid white on inner pages. Transitions to solid white on scroll. Includes admissions bar, logo+contact row, and nav links row
- **Hero**: Full-width background image (picwish.webp) with navy gradient overlay; title + stats + CTA on left, Quick Enquiry form card on right; quick-link pills at bottom
- **Images**: Real CDN images from rainbowinternationalschool.in with onError fallbacks; all images site-wide have `loading="lazy"` (or `eager` for hero/above-fold), `decoding="async"`, and explicit `width`/`height` for CLS prevention
- **SEO**: Every page has title, description, keywords, canonical, ogImage via `<SEO>` component; JSON-LD structured data (School on home, BlogPosting on blog SSR, BreadcrumbList on all inner pages); llms.txt for AI visibility; sitemap.xml with `lastmod` dates; semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<footer>` with ARIA roles)
- **Bot SSR**: `ssrPages.ts` serves pre-rendered HTML to search bots for 20 pages: About, Pre-Primary, Primary, Middle, Secondary, Senior Secondary, Contact, Amenities, Awards, Safety, Admissions, Fees, 3 locality pages, Quiz, Top Schools, Testimonials, FAQs. Navbar About dropdown includes Vision/Mission, Philosophy, Chairperson's Note. Footer Explore includes Top Schools, Testimonials, FAQs links.
- **Contact Form**: Inquiry form with time slot + class dropdowns, persists to PostgreSQL

## School Info (from real site)

- **Name**: Rainbow International School
- **Founded**: April 2009
- **Location**: Cosmos Arcade, Brahmand Phase 4, Thane, Maharashtra, India
- **Phone**: (022) 69105000 / +91 82915 68972
- **Email**: info@rainbowinternationalschool.in
- **CBSE Affiliation**: 1130661
- **Campus**: 3.5 acres
- **Students**: 3,000+ current, 1 Lac+ impacted
- **Grades**: Nursery to Class 12
- **Streams**: Science, Humanities, Commerce (Class 11–12)
- **Working Hours**: Mon – Sat, 9:00 AM – 6:00 PM

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe ORM for database operations
- **Drizzle Kit**: Database migration and schema push tooling (`npm run db:push`)

### Key NPM Packages
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm** + **drizzle-zod**: Database ORM with Zod schema generation
- **express**: HTTP server framework
- **zod**: Runtime type validation
- **date-fns**: Date formatting utilities
- **sonner**: Toast notifications (via shadcn toast component)

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **tsx**: TypeScript execution for development server
- **esbuild**: Production server bundling
- **@replit/vite-plugin-***: Replit-specific development plugins for error handling and navigation
