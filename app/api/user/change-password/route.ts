import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth'

/**
 * POST /api/user/change-password
 * Change user password
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password saat ini dan password baru harus diisi' },
        { status: 400 }
      )
    }

    // Validate password strength
    const { validatePassword } = await import('@/lib/auth')
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Fetch user with password
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUser = userResult[0]

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      currentUser.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 400 }
      )
    }

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(
      newPassword,
      currentUser.password
    )
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Password baru tidak boleh sama dengan password lama' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.userId))

    console.log(`✅ Password changed for user: ${currentUser.email}`)

    return NextResponse.json({
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
