import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './jwt'
import { authConfig } from './config'
import { cookies } from 'next/headers'

/**
 * Get authenticated user from request
 */
export async function getAuthUser(request?: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    let token: string | undefined

    if (request) {
      // From cookie
      token = request.cookies.get(authConfig.cookieName)?.value

      // From Authorization header (fallback)
      if (!token) {
        const authHeader = request.headers.get('authorization')
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.substring(7)
        }
      }
    } else {
      // Server components: get from cookies
      const cookieStore = await cookies()
      token = cookieStore.get(authConfig.cookieName)?.value
    }

    if (!token) {
      return null
    }

    // Verify token
    const payload = await verifyToken(token)

    if (!payload) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Get auth user error:', error)
    return null
  }
}

/**
 * Middleware to protect API routes
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: { userId: string; email: string; name?: string }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Get token from cookie or Authorization header
      let token = request.cookies.get(authConfig.cookieName)?.value

      if (!token) {
        const authHeader = request.headers.get('authorization')
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.substring(7)
        }
      }

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized - No token provided' },
          { status: 401 }
        )
      }

      // Verify token
      const payload = await verifyToken(token)

      if (!payload) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        )
      }

      // Call handler with user
      return handler(request, {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
      })
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware to require specific user roles
 * (You'll need to extend this after implementing role management)
 */
export function withRole(roles: string[]) {
  return (
    handler: (
      request: NextRequest,
      user: { userId: string; email: string; name?: string }
    ) => Promise<NextResponse>
  ) => {
    return withAuth(async (request, user) => {
      // TODO: Check user roles from database
      // For now, just pass through
      return handler(request, user)
    })
  }
}

/**
 * Create a redirect response for unauthenticated users
 */
export function createAuthRedirect(returnUrl?: string) {
  const loginUrl = new URL('/login', window.location.origin)

  if (returnUrl) {
    loginUrl.searchParams.set('redirect', returnUrl)
  }

  return NextResponse.redirect(loginUrl)
}
