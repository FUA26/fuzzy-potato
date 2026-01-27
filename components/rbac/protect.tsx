'use client'

import * as React from 'react'

interface ProtectProps {
  permissions?: string | string[]
  roles?: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
  requireAll?: boolean
}

/**
 * Protect component for conditional rendering based on user permissions and roles.
 *
 * @example
 * // Single permission
 * <Protect permission="users.create">
 *   <Button>Create User</Button>
 * </Protect>
 *
 * @example
 * // Multiple permissions (requireAll: true - user must have both)
 * <Protect permissions={["users.create", "users.update"]} requireAll>
 *   <Button>Manage Users</Button>
 * </Protect>
 *
 * @example
 * // Multiple permissions (requireAll: false - user needs at least one)
 * <Protect permissions={["users.create", "users.update"]}>
 *   <Button>User Action</Button>
 * </Protect>
 *
 * @example
 * // Role-based protection
 * <Protect roles={["Super Admin", "Administrator"]}>
 *   <Button>Admin Action</Button>
 * </Protect>
 *
 * @example
 * // With fallback
 * <Protect permission="users.delete" fallback={<span>Access Denied</span>}>
 *   <Button>Delete User</Button>
 * </Protect>
 */
export function Protect({
  permissions,
  roles,
  fallback = null,
  children,
  requireAll = true,
}: ProtectProps) {
  const [userPermissions, setUserPermissions] = React.useState<string[]>([])
  const [userRoles, setUserRoles] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUserPermissions(data.user.permissions || [])
          setUserRoles(
            data.user.roles?.map((r: { name: string }) => r.name) || []
          )
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Show loading state or nothing
  if (isLoading) {
    return null
  }

  // Check if user has wildcard permission (all permissions)
  const hasWildcard = userPermissions.includes('*')

  // Check permissions
  let hasPermission = true

  if (permissions) {
    const permsToCheck = Array.isArray(permissions)
      ? permissions
      : [permissions]

    if (requireAll) {
      // User must have all specified permissions
      hasPermission =
        hasWildcard || permsToCheck.every((p) => userPermissions.includes(p))
    } else {
      // User must have at least one of the specified permissions
      hasPermission =
        hasWildcard || permsToCheck.some((p) => userPermissions.includes(p))
    }
  }

  // Check roles
  let hasRole = true

  if (roles) {
    const rolesToCheck = Array.isArray(roles) ? roles : [roles]
    hasRole = rolesToCheck.some((r) => userRoles.includes(r))
  }

  // Render based on checks
  if (hasPermission && hasRole) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Server-side Protect component for use in Server Components.
 * This version expects permissions to be passed directly.
 */
interface ServerProtectProps {
  hasPermission: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function ServerProtect({
  hasPermission,
  fallback = null,
  children,
}: ServerProtectProps) {
  if (hasPermission) {
    return <>{children}</>
  }
  return <>{fallback}</>
}
