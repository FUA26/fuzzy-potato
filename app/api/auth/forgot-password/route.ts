import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { generateRandomToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (userResult.length === 0) {
      // Don't reveal if email exists or not
      return NextResponse.json({
        message: 'If email exists, password reset link has been sent',
      })
    }

    const user = userResult[0]

    // Generate reset token
    const resetToken = generateRandomToken()
    const resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour

    // Update user with reset token
    await db
      .update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      })
      .where(eq(users.id, user.id))

    // In production, send email here with reset link
    // For now, just return the token (REMOVE IN PRODUCTION!)
    console.log('Password reset token:', resetToken)

    return NextResponse.json({
      message: 'If email exists, password reset link has been sent',
      // Remove this in production!
      resetToken, // Only for development
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
