# Role-Based Access Control (RBAC) Implementation

This document describes the RBAC system implementation for controlling access to application features based on user roles and permissions.

## Overview

The RBAC system provides:
- **Database Schema**: Roles, Permissions, and their relationships
- **Permission Checking**: Server and client-side utilities
- **UI Protection**: Components to conditionally render elements
- **Menu Filtering**: Dynamic sidebar based on user permissions
- **Wildcard Support**: Special `*` permission grants all access

## Database Schema

### Tables

1. **roles**: Defines roles (e.g., Super Admin, Administrator, User)
2. **permissions**: Defines granular permissions (e.g., `users.read`, `posts.create`)
3. **user_roles**: Many-to-many relationship between users and roles
4. **role_permissions**: Many-to-many relationship between roles and permissions

### Permission Naming Convention

Follow the pattern: `resource.action`

Examples:
- `users.read` - View users
- `users.create` - Create new users
- `users.update` - Edit existing users
- `users.delete` - Delete users
- `settings.manage` - Access settings
- `*` - Wildcard (all permissions)

## Setup

### 1. Run Database Seed

Populate the database with default roles and permissions:

```bash
pnpm db:seed
```

This creates:
- **Super Admin**: All permissions (wildcard `*`)
- **Administrator**: Management permissions (no delete)
- **User**: Basic read and task management
- **Viewer**: Read-only access

### 2. Assign Roles to Users

Use the user management interface or directly in the database:

```typescript
import { db } from '@/db'
import { userRoles } from '@/db/schema'

await db.insert(userRoles).values({
  userId: 'user-id',
  roleId: 'super-admin-role-id',
})
```

## Usage

### Client-Side: Protect Component

Conditionally render UI elements based on permissions:

```tsx
import { Protect } from '@/components/rbac'

// Single permission
<Protect permission="users.create">
  <Button>Create User</Button>
</Protect>

// Multiple permissions (require all)
<Protect permissions={["users.update", "users.delete"]} requireAll>
  <Button>Manage Users</Button>
</Protect>

// Multiple permissions (require at least one)
<Protect permissions={["users.create", "users.update"]}>
  <Button>User Action</Button>
</Protect>

// Role-based protection
<Protect roles={["Super Admin", "Administrator"]}>
  <Button>Admin Action</Button>
</Protect>

// With fallback
<Protect
  permission="users.delete"
  fallback={<span>Access Denied</span>}
>
  <Button>Delete User</Button>
</Protect>
```

### Server-Side: Permission Checking

In Server Components:

```tsx
import {
  checkServerPermission,
  requireServerPermission,
} from '@/lib/rbac/server'

export default async function UsersPage() {
  // Check permission
  const canReadUsers = await checkServerPermission('users.read')

  if (!canReadUsers) {
    return <div>Access Denied</div>
  }

  // Or use requireServerPermission (throws error if no permission)
  try {
    await requireServerPermission('users.read')
    // ... proceed with rendering
  } catch (error) {
    return <div>Access Denied</div>
  }

  return <div>Users Page</div>
}
```

In API Routes:

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { requireServerPermission } from '@/lib/rbac/server'

export async function POST(req: NextRequest) {
  try {
    // Require permission before proceeding
    await requireServerPermission('users.create')

    // ... create user logic

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }
}
```

### Server Actions:

```tsx
'use server'

import { requireServerPermission } from '@/lib/rbac/server'
import { db } from '@/db'
import { users } from '@/db/schema'

export async function createUser(data: FormData) {
  // Check permission before creating user
  await requireServerPermission('users.create')

  // ... create user logic
}
```

### Menu/Navigation Filtering

The sidebar automatically filters navigation items based on user permissions. Each menu item can specify a `requiredPermission`:

```tsx
// In app-sidebar.tsx
{
  title: 'User Management',
  url: '/users',
  icon: Users,
  requiredPermission: 'users.read', // Only show if user has this permission
  items: [
    {
      title: 'Users',
      url: '/users',
      requiredPermission: 'users.read',
    },
    {
      title: 'Roles',
      url: '/roles',
      requiredPermission: 'roles.read',
    },
  ],
}
```

## API Reference

### Client-Side Utilities

#### `Protect` Component

Props:
- `permission?: string` - Single required permission
- `permissions?: string[]` - Array of permissions
- `roles?: string | string[]` - Required role(s)
- `requireAll?: boolean` - If true, user must have all permissions (default: true)
- `fallback?: ReactNode` - Content to show if permission check fails

#### `ServerProtect` Component

For use in Server Components with pre-checked permissions:

```tsx
<ServerProtect hasPermission={canReadUsers} fallback={<div>Denied</div>}>
  <ProtectedContent />
</ServerProtect>
```

### Server-Side Utilities

Import from `@/lib/rbac/server`:

- `getServerUser()` - Get current authenticated user
- `checkServerPermission(slug: string)` - Check single permission
- `checkServerAnyPermission(slugs: string[])` - Check if user has any permission
- `checkServerAllPermissions(slugs: string[])` - Check if user has all permissions
- `getServerUserPermissions()` - Get all user permissions
- `getServerUserRoles()` - Get all user roles
- `requireServerPermission(slug: string)` - Throw error if no permission
- `requireServerAnyPermission(slugs: string[])` - Throw error if no permissions

### Backend Functions

Import from `@/lib/auth`:

- `getUserPermissions(userId: string)` - Get user's permission slugs
- `checkPermission(userId: string, slug: string)` - Check if user has permission
- `checkAnyPermission(userId: string, slugs: string[])` - Check if user has any permission
- `checkAllPermissions(userId: string, slugs: string[])` - Check if user has all permissions
- `getUserRoles(userId: string)` - Get user's roles

## Default Permissions

### Dashboard
- `dashboard.view`

### User Management
- `users.read`
- `users.create`
- `users.update`
- `users.delete`

### Role Management
- `roles.read`
- `roles.create`
- `roles.update`
- `roles.delete`

### Permission Management
- `permissions.read`
- `permissions.create`
- `permissions.update`
- `permissions.delete`

### Task Management
- `tasks.read`
- `tasks.create`
- `tasks.update`
- `tasks.delete`
- `tasks.assign`

### Project Management
- `projects.read`
- `projects.create`
- `projects.update`
- `projects.delete`

### Settings
- `settings.manage`
- `settings.security`

### Wildcard
- `*` - Grants all permissions

## Best Practices

1. **Use Server-Side Checks**: Always validate permissions on the server, even if UI is protected
2. **Principle of Least Privilege**: Grant only the minimum permissions needed
3. **Permission Granularity**: Keep permissions granular (e.g., `users.create` instead of `users.manage`)
4. **Caching**: Permissions are cached in JWT tokens for performance
5. **System Roles**: Mark critical roles as `isSystem: true` to prevent accidental deletion
6. **Audit**: Keep track of permission changes for security audits

## Troubleshooting

### "Permission Denied" Errors

1. Check if the user is authenticated
2. Verify the user has the required role assigned
3. Confirm the role has the required permission
4. Check for typos in permission slugs

### Menu Items Not Showing

1. Verify the `requiredPermission` is set correctly
2. Check that the user's role includes the permission
3. Ensure permissions are loaded in the backoffice layout

### Performance Issues

Permissions are cached in JWT tokens, but if you need to refresh:
1. User must log out and log in again
2. Or implement a token refresh mechanism

## Future Enhancements

- Permission inheritance (child permissions)
- Custom permission creation UI
- Permission audit logs
- Time-based permissions (temporary access)
- IP-based restrictions
- Resource-level permissions (e.g., edit own posts vs all posts)
