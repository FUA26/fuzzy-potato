import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/db'
import { users } from '@/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { eq, or } from 'drizzle-orm'

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnSettings = nextUrl.pathname.startsWith('/settings')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnProjects = nextUrl.pathname.startsWith('/projects')
      const isOnTasks = nextUrl.pathname.startsWith('/tasks')
      const isOnUsers = nextUrl.pathname.startsWith('/users')
      const isOnRoles = nextUrl.pathname.startsWith('/roles')
      const isOnPermissions = nextUrl.pathname.startsWith('/permissions')

      const protectedRoutes =
        isOnDashboard ||
        isOnSettings ||
        isOnAdmin ||
        isOnProjects ||
        isOnTasks ||
        isOnUsers ||
        isOnRoles ||
        isOnPermissions

      if (protectedRoutes) {
        if (isLoggedIn) return true
        return false // Redirect to login page
      }

      // Redirect authenticated users away from auth pages
      const authRoutes = ['/login', '/register']
      if (authRoutes.includes(nextUrl.pathname) && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  trustHost: true,
})
