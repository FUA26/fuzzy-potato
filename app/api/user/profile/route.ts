import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: user[0] })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const body = await req.json()
    const { name, username } = body

    // Validate input
    if (username) {
      // Check if username is taken by another user
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1)

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await db
      .update(users)
      .set({
        name: name || undefined,
        username: username || undefined,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        image: users.image,
      })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser[0],
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
