import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth'

/**
 * GET /api/user/profile
 * Get current user profile
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user from database
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: userResult[0] })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile
 * Update current user profile
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, username, image } = body

    // Validate input
    if (!name && !username && !image) {
      return NextResponse.json(
        { error: 'Setidaknya satu field harus diisi' },
        { status: 400 }
      )
    }

    // Validate username format if provided
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          {
            error:
              'Username harus 3-30 karakter dan hanya boleh berisi huruf, angka, dan underscore',
          },
          { status: 400 }
        )
      }

      // Check if username is already taken by another user
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1)

      if (
        existingUsername.length > 0 &&
        existingUsername[0].id !== user.userId
      ) {
        return NextResponse.json(
          { error: 'Username sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updateData: {
      name?: string
      username?: string
      image?: string
      updatedAt: Date
    } = { updatedAt: new Date() }
    if (name) updateData.name = name
    if (username) updateData.username = username
    if (image) updateData.image = image

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        image: users.image,
        createdAt: users.createdAt,
      })

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`✅ Profile updated for user: ${updatedUser[0].email}`)

    return NextResponse.json({
      message: 'Profile berhasil diupdate',
      user: updatedUser[0],
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
