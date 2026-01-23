# Phase 3: Database Layer

## Objective

Implement a type-safe, performant database layer using Drizzle ORM and PostgreSQL.

## Tech Stack

- **ORM**: Drizzle ORM.
- **Migrations**: Drizzle Kit.
- **Driver**: `postgres` (or `neon-http` / `@vercel/postgres` depending on deployment, defaulting to standard `postgres` for broad compatibility).
- **Validation**: Zod (for schema-level validation if needed).

## Requirements

### 1. ORM Configuration

- **Folder Structure**:
  - `src/db/schema/*` - Split schema files for scalability (e.g., `users.ts`, `posts.ts`).
  - `src/db/index.ts` - Database client initialization and export.
- **Config**:
  - `drizzle.config.ts` setup for migration generation.

### 2. Connection Management

- **Pooling**: Use efficient connection pooling suitable for serverless (if deploying to Vercel/Edge).
- **Environment**: Securely load `DATABASE_URL` from `.env`.

### 3. Schema Design Pattern

- Use **Snake Case** for database columns (`first_name`) and **Camel Case** for TypeScript keys (`firstName`).
- Every table should have:
  - `id`: UUID or Auto-incrementing Serial.
  - `createdAt`: Timestamp default now.
  - `updatedAt`: Timestamp updated on change.

## Implementation Details

### Dependencies

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit  @types/pg
```

### Example Config (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Database Client (`src/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const queryClient = postgres(process.env.DATABASE_URL!)
export const db = drizzle(queryClient, { schema })
```
