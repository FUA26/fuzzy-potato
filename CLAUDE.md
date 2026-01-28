# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Feedback SaaS Platform** built with Next.js 16, featuring multi-project feedback collection, widget builder, analytics dashboard, and Role-Based Access Control (RBAC). The project includes both a backoffice for managing feedback projects and public APIs for widget integration.

**Core Product:**

- **Feedback Collection System**: Multi-project widget with customizable logic builder
- **Analytics Dashboard**: Real-time NPS, ratings, sentiment analysis
- **Widget Builder**: Visual editor for feedback forms with conditional logic
- **API-First**: Public widget APIs + private dashboard APIs

**Tech Stack:**

- Framework: Next.js 16.1.4 (App Router)
- Language: TypeScript (strict mode enabled)
- Styling: Tailwind CSS v4
- Package Manager: pnpm
- UI Components: Shadcn UI (Radix Primitives)
- Icons: Lucide React
- Theming: next-themes (Dark/Light mode)
- Fonts: Inter (Google Fonts)
- Database: Drizzle ORM + PostgreSQL
- Authentication: NextAuth.js with Credentials Provider
- Authorization: RBAC with fine-grained permissions

## Common Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)

# Building & Production
pnpm build           # Build for production
pnpm start           # Start production server

# Code Quality
pnpm lint            # Run ESLint
pnpm format          # Format code with Prettier
pnpm check-types     # Type checking without emit

# Database
pnpm db:generate     # Generate database migrations
pnpm db:migrate      # Run database migrations
pnpm db:push         # Push schema changes to database
pnpm db:studio       # Open Drizzle Studio for database GUI
```

## Architecture

### Project Structure

```
app/                      # Next.js App Router directory
  ├── (auth)/             # Auth routes (login, register, etc.)
  ├── (backoffice)/       # Protected backoffice routes
  ├── api/                # API routes
  │   ├── v1/             # Public API (widget)
  │   │   └── widget/     # Widget endpoints (config, feedback)
  │   ├── dashboard/      # Private API (dashboard)
  │   │   ├── projects/   # Project CRUD, stats, feedbacks
  │   │   └── feedbacks/  # Feedback management
  │   ├── auth/           # NextAuth endpoints
  │   └── admin/          # Admin endpoints (RBAC)
  ├── layout.tsx          # Root layout
  └── page.tsx            # Landing page
components/               # React components
  ├── ui/                 # Shadcn UI component primitives
  └── ...
db/                      # Database layer
  ├── index.ts            # Database client export (singleton pattern)
  ├── schema/             # Database schema definitions
  │   ├── users.ts        # Users table
  │   ├── roles.ts        # Roles table
  │   ├── permissions.ts  # Permissions table
  │   ├── user-roles.ts   # User-role junction table
  │   ├── role-permissions.ts # Role-permission junction table
  │   ├── resources.ts    # Resources table (RBAC)
  │   ├── projects.ts     # Projects table (Feedback SaaS)
  │   ├── feedbacks.ts    # Feedbacks table (high-volume)
  │   ├── webhooks.ts     # Webhooks table (integrations)
  │   └── index.ts        # Schema exports
  └── reset-feedback-tables.ts # Utility script
docs/                    # Project documentation
  ├── PRD.md              # Product Requirement Document (Feedback SaaS)
  ├── ERD.md              # Database Schema Documentation
  ├── API.md              # API Contract Specification
  └── ...
drizzle/                 # Database migrations (auto-generated)
lib/                     # Utility functions
  ├── api/               # API helpers
  │   └── auth.ts        # requireAuth() helper
  ├── auth/              # Authentication utilities
  │   ├── password.ts    # Password hashing
  │   └── permissions.ts # Permission helpers
  └── utils.ts           # Common utilities (cn() function)
```

### Path Aliases

- `@/*` maps to the root directory

### Key Architectural Decisions

1. **Code Philosophy**: "Functional code first, easy to read second"
   - Docstrings are essential for exported functions/components
   - Inline comments used sparingly for complex logic only
   - Strong typing required (avoid `any`)

2. **File Organization**:
   - Maintain flat-ish folder structure for AI readability
   - Descriptive file names over terse ones
   - Components split: `components/ui` (base primitives) vs `components/feature` (business logic)

3. **Commits**: Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)

4. **UI Patterns**:
   - Shadcn UI for component primitives
   - CSS variables for theming (dark/light mode)
   - `lib/utils.ts` contains standard `cn()` utility for class merging
   - Use `ThemeProvider` for theme switching with next-themes

5. **Security** (planned for Phase 5):
   - Use Server Actions for mutations
   - API routes must validate authentication
   - Implement CSP headers via `next.config.ts` or middleware

## Important Documentation

The `docs/` directory contains critical architectural context:

**Feedback SaaS Documentation:**

- `docs/PRD.md` - Product Requirement Document (features, business logic)
- `docs/ERD.md` - Database Schema Documentation (indexes, relationships)
- `docs/API.md` - API Contract Specification (endpoints, request/response)

**General Documentation:**

- `docs/GENERAL_KNOWLEDGE.md` - Best practices, technology decisions, coding standards
- `docs/PROJECT_ROADMAP.md` - Development phases

When making architectural decisions, reference these files first to maintain consistency with the project's long-term vision.

## Development Status

**Phase 1 - Completed:**

- Next.js initialized
- ESLint configured
- TypeScript strict mode enabled
- Tailwind CSS v4 set up
- Prettier configuration
- Husky + lint-staged for pre-commit hooks
- Commitlint for Conventional Commits enforcement

**Phase 2 - Completed:**

- Shadcn UI initialized with Tailwind CSS v4
- Theme provider configured (next-themes)
- Inter font configured
- Core UI components installed:
  - Button, Input, Label (Forms)
  - Card (Layout)
  - Dropdown Menu, Dialog, Sheet (Overlays)
  - Sonner (Notifications)
  - Avatar, Badge, Skeleton (Display)
- Utility functions created (`lib/utils.ts`)
- Landing page with header, banner, and navigation
- Theme toggle component

**Phase 3 - Database Layer: Completed**

- Drizzle ORM configured with PostgreSQL
- Database client with singleton pattern
- Auth & RBAC schemas: users, roles, permissions, user-roles, role-permissions, resources
- Feedback SaaS schemas: projects, feedbacks, webhooks
- High-performance indexes (composite, GIN for JSONB)
- Migration system with Drizzle Kit

**Phase 4 - Feedback SaaS Implementation: Completed**

- ✅ Public API (Widget): config endpoint with CORS protection, feedback submission
- ✅ Private API (Dashboard): Projects CRUD, analytics, feedback management
- ✅ Authentication: NextAuth.js with credentials provider
- ✅ Authorization: RBAC with fine-grained permissions
- ✅ Database optimization: Indexes for high-volume queries

**Current Status: API Layer Complete**

All backend APIs are implemented and ready:

- Projects management (create, read, update, delete)
- Feedback collection with validation (Zod)
- Analytics dashboard (NPS, average rating, time series)
- Advanced filtering (rating, tags, status, search)
- Pagination support
- Feature gating infrastructure (tier system)

**Next Phase: Frontend Dashboard UI** (Optional)

- Project list and management pages
- Widget Builder (Logic Builder UI)
- Feedback Inbox with filters
- Analytics charts and visualizations
- Installation page with script embed

See `docs/PROJECT_ROADMAP.md` for the complete development plan.
