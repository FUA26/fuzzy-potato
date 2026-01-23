import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Creates a PostgreSQL connection for query execution.
 *
 * For development, this uses a standard postgres connection.
 * For production serverless environments (Vercel, AWS Lambda), consider
 * using `@vercel/postgres` or Neon's `neon-http` driver instead.
 *
 * @see https://orm.drizzle.team/docs/get-started-postgresql
 */
const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 1,
})

export const db = drizzle(queryClient, { schema })
