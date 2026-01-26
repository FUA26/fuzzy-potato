import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, validatePassword } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'

/**
 * Rate limiting store for registration attempts
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit for registration attempts
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 3 // Max 3 registrations per hour per IP/email

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
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, username } = body

    console.log('Register attempt:', { email, name, username })

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Check rate limit
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi dalam 1 jam.',
        },
        { status: 429 }
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

    // Validate username format (if provided)
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
        { error: 'Email sudah terdaftar' },
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
          { error: 'Username sudah digunakan' },
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

    // Send welcome email (async, don't wait)
    sendWelcomeEmail({
      to: newUser[0].email,
      userName: newUser[0].name || newUser[0].username || undefined,
    }).catch((error) => {
      console.error('Failed to send welcome email:', error)
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser[0]

    return NextResponse.json(
      {
        message: 'Pendaftaran berhasil. Selamat datang di Super App Naiera!',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan server. Silakan coba lagi.',
        details:
          process.env.NODE_ENV !== 'production' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    )
  }
}
