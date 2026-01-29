import { handlers } from '@/auth'

// Runtime configuration: explicitly use Node.js runtime
// This is required because postgres-js driver needs Node.js 'net' module
// which is not available in Edge Runtime
export const runtime = 'nodejs'

/**
 * NextAuth API route handler.
 *
 * This route handles all authentication endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 *
 * @see https://authjs.dev/reference/nextjs
 */
export const { GET, POST } = handlers
