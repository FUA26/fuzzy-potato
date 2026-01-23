import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]
const authRoutes = ['/login', '/register']

// Get JWT_SECRET at module level for Edge Runtime compatibility
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value

  // Check if user is authenticated
  let isAuthenticated = false
  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      isAuthenticated = !!payload?.userId
    } catch {
      // Invalid token, continue as unauthenticated
      isAuthenticated = false
    }
  }

  // Redirect to dashboard if trying to access auth routes while authenticated
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect to login if trying to access protected route while not authenticated
  if (
    !isAuthenticated &&
    !publicRoutes.some((route) => pathname.startsWith(route))
  ) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

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
