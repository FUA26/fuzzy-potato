import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { verifyPassword, signToken, getUserPermissions, getUserRoles } from '@/lib/auth'
import { eq, or } from 'drizzle-orm'

/**
 * Rate limiting store for login attempts
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for login attempts
 */
function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // Max 5 login attempts per 15 minutes

  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remainingAttempts: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remainingAttempts: 0 }
  }

  record.count++
  return { allowed: true, remainingAttempts: maxRequests - record.count }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(email)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
        },
        { status: 429 }
      )
    }

    // Find user by email or username
    const userResult = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, email)))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Email atau password salah',
          remainingAttempts: rateLimit.remainingAttempts - 1,
        },
        { status: 401 }
      )
    }

    const user = userResult[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: 'Email atau password salah',
          remainingAttempts: rateLimit.remainingAttempts - 1,
        },
        { status: 401 }
      )
    }

    // Get user permissions and roles
    const [userPermissions, userRolesData] = await Promise.all([
      getUserPermissions(user.id),
      getUserRoles(user.id),
    ])

    const roleNames = userRolesData.map((r) => r.name)

    // Generate JWT token with permissions and roles
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      permissions: userPermissions,
      roles: roleNames,
    })

    // Create response and set cookie
    const response = NextResponse.json(
      {
        message: 'Login berhasil',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 200 }
    )

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    console.log(`✅ Login successful for user: ${user.email}`)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
