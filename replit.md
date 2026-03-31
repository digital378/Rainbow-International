# Rainbow International School Website

## Overview

A full-stack replication of the Rainbow International School website (rainbowinternationalschool.in) — a CBSE-affiliated school in Thane West, Maharashtra. Built with React frontend, Express.js backend, and PostgreSQL database.

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
- **Fonts**: Open Sans (sans-serif) and Merriweather (serif) from Google Fonts

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful JSON API endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod

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
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared code between frontend and backend
│   └── schema.ts     # Drizzle schema definitions and Zod types
└── migrations/       # Database migrations (Drizzle Kit)
```

## Pages (18 total)

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

## Key Components

- **SEO.tsx** — Dynamic `<head>` meta tag manager for per-page SEO
- **PageBanner.tsx** — Hero banner with title, subtitle, and breadcrumb for inner pages
- **Navbar.tsx** — Sticky navbar with top bar (phone/email), dropdown menus for Academics and Explore, mobile menu
- **Footer.tsx** — 4-column footer with logo, links, explore, and contact info

## Content Design

- **Design**: "Playful Academic" aesthetic — school blue (primary) + energetic yellow (secondary)
- **Images**: Real CDN images from rainbowinternationalschool.in with onError fallbacks
- **SEO**: Every page has title, description, keywords, canonical, ogImage via `<SEO>` component
- **Contact Form**: Inquiry form with time slot + class dropdowns, persists to PostgreSQL

## School Info (from real site)

- **Name**: Rainbow International School
- **Founded**: April 2009
- **Location**: Cosmos Arcade, Brahmand Phase 4, Thane West, Maharashtra, India
- **Phone**: (022) 69105000 / +91 82915 68972
- **Email**: info@rainbowinternationalschool.in
- **CBSE Affiliation**: 1130661
- **Campus**: 3.5 acres
- **Students**: 3,000+ current, 50,000+ impacted
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
