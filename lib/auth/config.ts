/**
 * Authentication configuration
 */

export const authConfig = {
  /**
   * JWT Secret - should be set in .env
   * Generate with: openssl rand -base64 32
   */
  jwtSecret:
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',

  /**
   * JWT expiration time
   */
  jwtExpiresIn: '7d',

  /**
   * Cookie name for JWT token
   */
  cookieName: 'auth_token',

  /**
   * App URL for redirects
   */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const
