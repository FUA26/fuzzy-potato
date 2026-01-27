import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getUserPermissions, getUserRoles } from '@/lib/auth'

/**
 * Server-side utility to get the current authenticated user from the JWT token.
 *
 * @returns The user data from the token or null if not authenticated
 */
export async function getServerUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

/**
 * Server-side utility to check if the current user has a specific permission.
 *
 * This is useful in Server Components and API routes to protect resources.
 *
 * @param permissionSlug - The permission to check (e.g., 'users.create')
 * @returns true if user has the permission, false otherwise
 *
 * @example
 * // In a Server Component
 * const canCreateUsers = await checkServerPermission('users.create')
 * if (!canCreateUsers) {
 *   return <div>Access Denied</div>
 * }
 */
export async function checkServerPermission(
  permissionSlug: string
): Promise<boolean> {
  const user = await getServerUser()

  if (!user) {
    return false
  }

  // Check if permissions are cached in the token
  if (user.permissions) {
    return (
      user.permissions.includes('*') ||
      user.permissions.includes(permissionSlug)
    )
  }

  // Fallback: fetch from database
  const permissions = await getUserPermissions(user.userId)
  return permissions.includes('*') || permissions.includes(permissionSlug)
}

/**
 * Server-side utility to check if the current user has any of the specified permissions.
 *
 * @param permissionSlugs - Array of permissions to check
 * @returns true if user has at least one of the permissions, false otherwise
 */
export async function checkServerAnyPermission(
  permissionSlugs: string[]
): Promise<boolean> {
  const user = await getServerUser()

  if (!user) {
    return false
  }

  // Check if permissions are cached in the token
  if (user.permissions) {
    if (user.permissions.includes('*')) {
      return true
    }
    return permissionSlugs.some((slug) => user.permissions?.includes(slug))
  }

  // Fallback: fetch from database
  const permissions = await getUserPermissions(user.userId)
  if (permissions.includes('*')) {
    return true
  }
  return permissionSlugs.some((slug) => permissions.includes(slug))
}

/**
 * Server-side utility to check if the current user has all of the specified permissions.
 *
 * @param permissionSlugs - Array of permissions to check
 * @returns true if user has all permissions, false otherwise
 */
export async function checkServerAllPermissions(
  permissionSlugs: string[]
): Promise<boolean> {
  const user = await getServerUser()

  if (!user) {
    return false
  }

  // Check if permissions are cached in the token
  if (user.permissions) {
    if (user.permissions.includes('*')) {
      return true
    }
    return permissionSlugs.every((slug) => user.permissions?.includes(slug))
  }

  // Fallback: fetch from database
  const permissions = await getUserPermissions(user.userId)
  if (permissions.includes('*')) {
    return true
  }
  return permissionSlugs.every((slug) => permissions.includes(slug))
}

/**
 * Server-side utility to get the current user's permissions.
 *
 * @returns Array of permission slugs
 */
export async function getServerUserPermissions(): Promise<string[]> {
  const user = await getServerUser()

  if (!user) {
    return []
  }

  // Return cached permissions from token if available
  if (user.permissions) {
    return user.permissions
  }

  // Fallback: fetch from database
  return getUserPermissions(user.userId)
}

/**
 * Server-side utility to get the current user's roles.
 *
 * @returns Array of role objects
 */
export async function getServerUserRoles(): Promise<
  Array<{ id: string; name: string; isSystem: boolean }>
> {
  const user = await getServerUser()

  if (!user) {
    return []
  }

  // Return cached roles from token if available
  if (user.roles) {
    return user.roles.map((name) => ({
      id: '',
      name,
      isSystem: false,
    }))
  }

  // Fallback: fetch from database
  return getUserRoles(user.userId)
}

/**
 * Server-side authorization guard.
 * Throws an error if the user doesn't have the required permission.
 *
 * @param permissionSlug - The required permission
 * @throws Error if user is not authenticated or doesn't have the permission
 *
 * @example
 * // In an API route
 * export async function POST(req: NextRequest) {
 *   await requireServerPermission('users.create')
 *   // ... proceed with creating user
 * }
 */
export async function requireServerPermission(
  permissionSlug: string
): Promise<void> {
  const hasPermission = await checkServerPermission(permissionSlug)

  if (!hasPermission) {
    throw new Error(
      `Permission denied: Required permission "${permissionSlug}" not found`
    )
  }
}

/**
 * Server-side authorization guard for multiple permissions.
 * Throws an error if the user doesn't have any of the required permissions.
 *
 * @param permissionSlugs - Array of required permissions (user needs at least one)
 * @throws Error if user is not authenticated or doesn't have any of the permissions
 */
export async function requireServerAnyPermission(
  permissionSlugs: string[]
): Promise<void> {
  const hasPermission = await checkServerAnyPermission(permissionSlugs)

  if (!hasPermission) {
    throw new Error(
      `Permission denied: Required one of permissions [${permissionSlugs.join(', ')}]`
    )
  }
}
