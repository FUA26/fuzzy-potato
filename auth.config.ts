import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
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
  providers: [], // Configured in auth.ts
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  trustHost: true,
} satisfies NextAuthConfig
