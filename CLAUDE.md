# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 fullstack boilerplate using App Router, TypeScript, and Tailwind CSS v4. The project follows a phased development approach documented in `docs/PROJECT_ROADMAP.md`. Currently in Phase 3 (Database Layer).

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
- Planned: Authentication & Features (Phase 4)

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
app/                 # Next.js App Router directory
  ├── layout.tsx     # Root layout with fonts & metadata
  ├── page.tsx       # Main page
  └── globals.css    # Global styles (Tailwind v4)
components/          # React components
  ├── theme-provider.tsx  # Theme provider for dark/light mode
  └── ui/            # Shadcn UI component primitives
db/                  # Database layer
  ├── index.ts       # Database client export
  └── schema/        # Database schema definitions
      ├── users.ts   # Users table
      ├── posts.ts   # Posts table
      └── index.ts   # Schema exports
docs/                # Project documentation
drizzle/             # Database migrations (auto-generated)
lib/                 # Utility functions
  └── utils.ts       # Common utilities (cn() function)
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

- `docs/GENERAL_KNOWLEDGE.md` - Best practices, technology decisions, coding standards
- `docs/PROJECT_ROADMAP.md` - 6-phase development plan
- `docs/PHASE_3_DATABASE.md` - Current phase requirements (Database Layer)

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

**Phase 3 - In Progress:**

- Drizzle ORM configured with PostgreSQL
- Database client initialized in `src/db/index.ts`
- Example schemas created:
  - Users table (id, email, name, username, image, timestamps)
  - Posts table (id, title, content, published, authorId, timestamps)
- Drizzle Kit configuration for migrations
- Database scripts added to package.json
- Environment variables documented in `.env.example`

**Still needed in Phase 3:**

None - Phase 3 is complete!

**Next Phase (Phase 4):**

- Authentication system implementation
- User registration and login
- Feature development

See `docs/PROJECT_ROADMAP.md` for the complete development plan.
