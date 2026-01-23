import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, validatePassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, username } = body

    console.log('Register attempt:', { email, name, username })

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      console.log('Password validation failed:', passwordValidation.errors)
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      console.log('Email already exists')
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if username already exists
    if (username) {
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1)

      if (existingUsername.length > 0) {
        console.log('Username already exists')
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    console.log('Password hashed successfully')

    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name: name || null,
        username: username || null,
      })
      .returning()

    console.log('User created:', newUser[0].id)

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser[0]

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
