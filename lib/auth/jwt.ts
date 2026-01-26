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
 * Generate a cryptographically secure random token
 */
export function generateRandomToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Use native crypto API if available (Node.js 16+, modern browsers)
    return crypto.randomUUID()
  }

  // Fallback: generate a secure random token
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    // Node.js fallback
    require('crypto').randomFillSync(array)
  }

  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a secure token with specified length
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)

  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    require('crypto').randomFillSync(array)
  }

  return Array.from(array, (byte) => chars[byte % chars.length]).join('')
}
