import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/db'
import { users } from '@/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { getUserPermissions } from '@/lib/auth/permissions'
import { eq, or } from 'drizzle-orm'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email or username
        const userResult = await db
          .select()
          .from(users)
          .where(or(eq(users.email, email), eq(users.username, email)))
          .limit(1)

        if (userResult.length === 0) {
          return null
        }

        const user = userResult[0]

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password)
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Add user ID to token on sign in
      if (user) {
        token.id = user.id
        // Load permissions once and store in JWT token
        try {
          const permissions = await getUserPermissions(user.id as string)
          token.permissions = permissions
        } catch (error) {
          console.error('Error loading user permissions:', error)
          token.permissions = []
        }
      }

      // Handle session update (if needed in future)
      if (trigger === 'update' && session) {
        return { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        // Permissions from JWT token (cached, no DB hit)
        session.user.permissions = (token.permissions as string[]) || []
      }
      return session
    },
  },
})
