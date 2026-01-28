import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

const { auth } = NextAuth(authConfig)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitStore {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitStore>()

const RATE_LIMIT = 100 // requests per window
const RATE_LIMIT_WINDOW = 60000 // 1 minute in milliseconds

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

function checkRateLimit(identifier: string): {
  allowed: boolean
  remaining: number
} {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count }
}

function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, RATE_LIMIT_WINDOW)
}

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]
const authRoutes = ['/login', '/register']

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    const identifier = getClientIdentifier(req)
    const { allowed, remaining } = checkRateLimit(identifier)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set(
      'X-RateLimit-Reset',
      Math.floor(Date.now() / 1000 + 60).toString()
    )
    return response
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth?.user

  // Redirect to dashboard if trying to access auth routes while authenticated
  if (authRoutes.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect to login if trying to access protected route while not authenticated
  if (
    !isLoggedIn &&
    !publicRoutes.some((route) => pathname.startsWith(route))
  ) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
