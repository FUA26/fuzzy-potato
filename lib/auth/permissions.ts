import { db } from '@/db'
import { userRoles, rolePermissions, permissions, roles } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Get all permission slugs for a user.
 *
 * This function:
 * 1. Finds all roles assigned to the user
 * 2. Finds all permissions associated with those roles
 * 3. Returns a flat array of permission slugs
 *
 * @param userId - The user's ID
 * @returns Array of permission slugs (e.g., ['users.read', 'posts.create'])
 */
export async function getUserPermissions(
  userId: string
): Promise<string[]> {
  const userPermissions = await db
    .select({
      slug: permissions.slug,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(
      rolePermissions,
      eq(rolePermissions.roleId, roles.id)
    )
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId))

  return userPermissions.map((p) => p.slug)
}

/**
 * Check if a user has a specific permission.
 *
 * Also supports wildcard permission '*' which grants all permissions.
 *
 * @param userId - The user's ID
 * @param permissionSlug - The permission slug to check (e.g., 'users.read')
 * @returns true if user has the permission, false otherwise
 */
export async function checkPermission(
  userId: string,
  permissionSlug: string
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)

  // Check for wildcard permission (grants all permissions)
  if (userPermissions.includes('*')) {
    return true
  }

  return userPermissions.includes(permissionSlug)
}

/**
 * Check if a user has any of the specified permissions.
 *
 * @param userId - The user's ID
 * @param permissionSlugs - Array of permission slugs to check
 * @returns true if user has at least one of the permissions, false otherwise
 */
export async function checkAnyPermission(
  userId: string,
  permissionSlugs: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)

  // Check for wildcard permission
  if (userPermissions.includes('*')) {
    return true
  }

  return permissionSlugs.some((slug) => userPermissions.includes(slug))
}

/**
 * Check if a user has all of the specified permissions.
 *
 * @param userId - The user's ID
 * @param permissionSlugs - Array of permission slugs to check
 * @returns true if user has all permissions, false otherwise
 */
export async function checkAllPermissions(
  userId: string,
  permissionSlugs: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)

  // Check for wildcard permission
  if (userPermissions.includes('*')) {
    return true
  }

  return permissionSlugs.every((slug) => userPermissions.includes(slug))
}

/**
 * Get all roles for a user.
 *
 * @param userId - The user's ID
 * @returns Array of role objects with id and name
 */
export async function getUserRoles(
  userId: string
): Promise<Array<{ id: string; name: string; isSystem: boolean }>> {
  const userRolesData = await db
    .select({
      id: roles.id,
      name: roles.name,
      isSystem: roles.isSystem,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))

  return userRolesData
}
