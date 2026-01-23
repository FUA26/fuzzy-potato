import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { authConfig } from './config'

export interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  name?: string
}

/**
 * Sign a JWT token
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(authConfig.jwtSecret)
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  return token
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(authConfig.jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

/**
 * Generate a random token for email verification or password reset
 */
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
