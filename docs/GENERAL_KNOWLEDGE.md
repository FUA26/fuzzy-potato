# General Knowledge Base: Next.js Fullstack Boilerplate

This document serves as the central repository for best practices, architectural decisions, and known patterns for this project.

## 1. Core Technologies

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL (via Drizzle ORM)
- **Package Manager**: npm/pnpm (to be decided, defaulting to npm for broad compatibility unless specified)

## 2. Best Practices

### Next.js Security (v14/15)

- **Security Headers**: Implement strict Content Security Policy (CSP), X-Content-Type-Options, and X-Frame-Options.
  - _Implementation_: Use `next.config.js` `headers()` for global headers or Middleware for dynamic nonce generation.
- **API Protection**:
  - Use Server Actions for mutations where possible.
  - API Routes should always validate authentication session (e.g., via generic `auth()` helper).
  - Rate limiting should be applied to public endpoints.

### Drizzle ORM

- **Schema**: Define schema in a dedicated file or split by domain (e.g., `src/db/schema/users.ts`).
- **Config**: Use `drizzle.config.ts` with `defineConfig` for type safety.
- **Migration**: Use `drizzle-kit` for generating and pushing migrations.
- **Connection**: Ensure connection pooling is used for production (e.g., if using Neon or specific PG providers).

### UI & Styling (Shadcn)

- **Init**: `npx shadcn@latest init`.
- **Structure**:
  - `components/ui`: Base primitives (buttons, inputs).
  - `components/feature`: Business logic components.
  - `lib/utils.ts`: Standard cn() utility.
- **Theming**: Use CSS variables for simplified dark mode switching.

## 3. Code Behavior & AI Collaboration

- **Philosophy**: "Functional code first, easy to read second."
- **Comments**:
  - **Docstrings**: Essential for exported functions/components.
  - **Inline**: Use sparingly for complex logic.
- **AI-Readability**:
  - File names should be descriptive.
  - Maintain a flat-ish folder structure where possible to avoid deep nesting confusion.
  - Use strong typing (avoid `any`).

## 4. Workflows

- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat`: New feature
  - `fix`: Bug fix
  - `chore`: Maintenance
  - `docs`: Documentation
- **Linting**:
  - `eslint` for logic errors (Next.js Core Web Vitals).
  - `prettier` for formatting.
  - `husky` + `lint-staged` to enforce quality before commit.
