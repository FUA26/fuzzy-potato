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

let queryClient: postgres.Sql<Record<string, never>> | null = null
let dbInstance: ReturnType<typeof drizzle> | null = null

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return url
}

export function getDb() {
  if (!dbInstance) {
    const url = getDatabaseUrl()
    console.log('[DB] Initializing database connection...')
    queryClient = postgres(url, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
    dbInstance = drizzle(queryClient, { schema })
    console.log('[DB] Database connection initialized successfully')
  }
  return dbInstance
}

// Legacy export for backward compatibility
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const db = getDb()
    return db[prop as keyof typeof db]
  },
})
