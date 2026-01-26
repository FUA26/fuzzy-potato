import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authConfig } from '@/lib/auth/config'

/**
 * POST /api/auth/logout
 * Logout user by clearing auth token cookie
 */
export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear the auth token cookie
    cookieStore.delete(authConfig.cookieName)

    console.log('✅ User logged out successfully')

    return NextResponse.json({
      message: 'Logout berhasil',
      success: true,
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    )
  }
}
