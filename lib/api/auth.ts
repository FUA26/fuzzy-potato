import { auth } from '@/auth'
import { NextResponse } from 'next/server'

/**
 * Helper function to check authentication for dashboard API routes.
 * Returns the session if authenticated, or error response if not.
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  return { error: null, session }
}
