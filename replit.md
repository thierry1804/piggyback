# Piggyback - Savings Goal Tracker

## Overview

Piggyback is a personal savings goal tracker application that helps users manage multiple financial goals. Users can create savings goals with custom icons and colors, track progress through deposits and withdrawals, and visualize their savings journey with animated progress bars. The application follows a monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for progress bars and transitions
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Development**: Hot module replacement via Vite middleware in development mode

### Data Storage
- **Database**: PostgreSQL (required DATABASE_URL environment variable)
- **Schema Location**: shared/schema.ts using Drizzle's pgTable definitions
- **Migrations**: Drizzle Kit with migrations output to ./migrations folder
- **Tables**:
  - `settings`: Global app settings (currency preferences)
  - `goals`: Savings goals with name, target amount, current amount, icon, color
  - `transactions`: Individual deposits/withdrawals linked to goals

### Shared Code Structure
- **shared/schema.ts**: Database schema definitions and Zod insert schemas
- **shared/routes.ts**: API route definitions with path, method, input/output schemas
- **Path Aliases**: TypeScript paths configured for @shared/* imports

### Key Design Patterns
- **Type-Safe API**: Routes defined with Zod schemas shared between client and server
- **Cents-Based Currency**: All monetary values stored as integers (cents) to avoid floating-point issues
- **Optimistic Updates**: React Query invalidates related queries after mutations
- **Component Composition**: UI built from shadcn/ui primitives with custom styling

## External Dependencies

### Database
- **PostgreSQL**: Required, configured via DATABASE_URL environment variable
- **Connection**: Uses node-postgres (pg) Pool for database connections

### UI/Styling
- **Radix UI**: Full suite of accessible, unstyled components
- **Tailwind CSS**: Utility-first CSS with custom theme configuration
- **Google Fonts**: DM Sans (body) and Outfit (display headings)
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development
- **Drizzle Kit**: Database migrations and schema management

### Runtime Dependencies
- **express**: Web server framework
- **drizzle-orm**: Database ORM
- **zod**: Schema validation for API inputs/outputs
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **date-fns**: Date formatting utilities