import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { generateRandomToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'
import { authConfig } from '@/lib/auth/config'

/**
 * Rate limiting store (in-memory for development)
 * In production, use Redis or a proper rate limiting service
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for forgot password requests
 */
function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 3 // Max 3 requests per 15 minutes

  const record = rateLimitStore.get(email)

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(email, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check rate limit
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.',
        },
        { status: 429 }
      )
    }

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (userResult.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({
        message:
          'Jika email terdaftar, link reset password akan dikirim ke email Anda.',
      })
    }

    const user = userResult[0]

    // Generate secure reset token
    const resetToken = generateRandomToken()
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await db
      .update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      })
      .where(eq(users.id, user.id))

    // Create reset URL
    const resetUrl = `${authConfig.appUrl}/reset-password?token=${resetToken}`

    // Send password reset email
    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      userName: user.name || user.username || undefined,
      resetUrl,
    })

    if (!emailSent) {
      console.error('Failed to send password reset email')
      // In production, you might want to queue this for retry
      // For now, we'll continue and let the user know to try again
    }

    // Log for development (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔗 Password Reset Link (Development):')
      console.log(resetUrl)
    }

    return NextResponse.json({
      message:
        'Jika email terdaftar, link reset password akan dikirim ke email Anda.',
      // Only include token in development for testing
      ...(process.env.NODE_ENV !== 'production' && {
        devToken: resetToken,
        devResetUrl: resetUrl,
      }),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}