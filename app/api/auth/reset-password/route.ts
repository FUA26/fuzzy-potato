import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, validatePassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'

/**
 * Rate limiting store for reset password attempts
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for reset password attempts
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // Max 5 attempts per 15 minutes

  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
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
 * POST /api/auth/reset-password
 * Reset password using a valid reset token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = body

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: 'Token reset tidak valid' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password baru harus diisi' },
        { status: 400 }
      )
    }

    // Check rate limit based on token
    if (!checkRateLimit(token)) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.',
        },
        { status: 429 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: passwordValidation.errors[0],
        },
        { status: 400 }
      )
    }

    // Find user with valid reset token
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Link reset tidak valid atau sudah kadaluarsa. Silakan minta link baru.',
        },
        { status: 400 }
      )
    }

    const user = userResult[0]

    // Check if token is expired
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      // Clear expired token
      await db
        .update(users)
        .set({
          resetPasswordToken: null,
          resetPasswordExpires: null,
        })
        .where(eq(users.id, user.id))

      return NextResponse.json(
        {
          error: 'Link reset sudah kadaluarsa. Silakan minta link reset baru.',
        },
        { status: 400 }
      )
    }

    // Check if new password is same as old password
    const { verifyPassword } = await import('@/lib/auth')
    const isSamePassword = await verifyPassword(password, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        {
          error: 'Password baru tidak boleh sama dengan password lama.',
        },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    console.log(`✅ Password reset successful for user: ${user.email}`)

    return NextResponse.json({
      message: 'Password berhasil direset. Silakan login dengan password baru.',
      success: true,
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan server. Silakan coba lagi.',
      },
      { status: 500 }
    )
  }
}
