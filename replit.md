# Rainbow International School Website

## Overview

This is a school website for Rainbow International School built with a modern full-stack TypeScript architecture. The application features a React frontend with Tailwind CSS styling and an Express.js backend with PostgreSQL database storage. It serves as a public-facing website showcasing the school's programs, events, and providing an inquiry form for prospective parents.

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
│   │   ├── components/  # React components (ui/, home/, layout/)
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and query client
├── server/           # Backend Express application
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared code between frontend and backend
│   └── schema.ts     # Drizzle schema definitions and Zod types
└── migrations/       # Database migrations (Drizzle Kit)
```

### Data Flow
1. Frontend components use TanStack Query to fetch data from API endpoints
2. Express routes handle requests, validate with Zod schemas
3. Storage layer performs database operations via Drizzle ORM
4. Shared schema ensures type consistency across frontend and backend

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