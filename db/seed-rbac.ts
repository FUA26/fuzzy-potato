import { db } from '@/db'
import { roles, permissions, rolePermissions } from '@/db/schema'

/**
 * Seed default roles and permissions for RBAC system.
 *
 * This script creates:
 * - Super Admin role with all permissions (*)
 * - User role with basic permissions
 * - Administrator role with management permissions
 *
 * Run with: npx tsx db/seed-rbac.ts
 */

const defaultPermissions = [
  // Dashboard
  {
    name: 'View Dashboard',
    slug: 'dashboard.view',
    resource: 'dashboard',
    action: 'view',
  },

  // User Management
  { name: 'View Users', slug: 'users.read', resource: 'users', action: 'read' },
  {
    name: 'Create Users',
    slug: 'users.create',
    resource: 'users',
    action: 'create',
  },
  {
    name: 'Update Users',
    slug: 'users.update',
    resource: 'users',
    action: 'update',
  },
  {
    name: 'Delete Users',
    slug: 'users.delete',
    resource: 'users',
    action: 'delete',
  },

  // Role Management
  { name: 'View Roles', slug: 'roles.read', resource: 'roles', action: 'read' },
  {
    name: 'Create Roles',
    slug: 'roles.create',
    resource: 'roles',
    action: 'create',
  },
  {
    name: 'Update Roles',
    slug: 'roles.update',
    resource: 'roles',
    action: 'update',
  },
  {
    name: 'Delete Roles',
    slug: 'roles.delete',
    resource: 'roles',
    action: 'delete',
  },

  // Permission Management
  {
    name: 'View Permissions',
    slug: 'permissions.read',
    resource: 'permissions',
    action: 'read',
  },
  {
    name: 'Create Permissions',
    slug: 'permissions.create',
    resource: 'permissions',
    action: 'create',
  },
  {
    name: 'Update Permissions',
    slug: 'permissions.update',
    resource: 'permissions',
    action: 'update',
  },
  {
    name: 'Delete Permissions',
    slug: 'permissions.delete',
    resource: 'permissions',
    action: 'delete',
  },

  // Task Management
  { name: 'View Tasks', slug: 'tasks.read', resource: 'tasks', action: 'read' },
  {
    name: 'Create Tasks',
    slug: 'tasks.create',
    resource: 'tasks',
    action: 'create',
  },
  {
    name: 'Update Tasks',
    slug: 'tasks.update',
    resource: 'tasks',
    action: 'update',
  },
  {
    name: 'Delete Tasks',
    slug: 'tasks.delete',
    resource: 'tasks',
    action: 'delete',
  },
  {
    name: 'Assign Tasks',
    slug: 'tasks.assign',
    resource: 'tasks',
    action: 'assign',
  },

  // Project Management
  {
    name: 'View Projects',
    slug: 'projects.read',
    resource: 'projects',
    action: 'read',
  },
  {
    name: 'Create Projects',
    slug: 'projects.create',
    resource: 'projects',
    action: 'create',
  },
  {
    name: 'Update Projects',
    slug: 'projects.update',
    resource: 'projects',
    action: 'update',
  },
  {
    name: 'Delete Projects',
    slug: 'projects.delete',
    resource: 'projects',
    action: 'delete',
  },

  // Settings
  {
    name: 'Manage Settings',
    slug: 'settings.manage',
    resource: 'settings',
    action: 'manage',
  },
  {
    name: 'Manage Security',
    slug: 'settings.security',
    resource: 'settings',
    action: 'security',
  },

  // Wildcard permission for super admin
  { name: 'All Permissions', slug: '*', resource: '*', action: '*' },
]

async function seed() {
  console.log('🌱 Starting RBAC seed...')

  try {
    // Insert permissions
    console.log('📝 Inserting permissions...')
    const insertedPermissions = await db
      .insert(permissions)
      .values(defaultPermissions)
      .onConflictDoNothing()
      .returning()

    console.log(`✅ Inserted ${insertedPermissions.length} permissions`)

    // Get all permission slugs
    const allPermissions = await db.select().from(permissions)
    const wildcardPermission = allPermissions.find((p) => p.slug === '*')
    const basicPermissionSlugs = allPermissions
      .filter((p) => p.slug !== '*')
      .map((p) => p.slug)

    // Create roles
    console.log('👥 Creating roles...')

    // Super Admin Role
    const [superAdminRole] = await db
      .insert(roles)
      .values({
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
      })
      .onConflictDoNothing()
      .returning()

    if (superAdminRole && wildcardPermission) {
      await db
        .insert(rolePermissions)
        .values({
          roleId: superAdminRole.id,
          permissionId: wildcardPermission.id,
        })
        .onConflictDoNothing()

      console.log(`✅ Created Super Admin role with all permissions`)
    }

    // Admin Role
    const [adminRole] = await db
      .insert(roles)
      .values({
        name: 'Administrator',
        description:
          'Administrative access to manage users, roles, and content',
        isSystem: true,
      })
      .onConflictDoNothing()
      .returning()

    if (adminRole) {
      // Admin gets all management permissions except wildcard
      const adminPermissionSlugs = allPermissions
        .filter((p) => !p.slug.includes('delete') && p.slug !== '*')
        .map((p) => p.id)

      for (const permissionId of adminPermissionSlugs) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: adminRole.id,
            permissionId,
          })
          .onConflictDoNothing()
      }

      console.log(`✅ Created Administrator role`)
    }

    // User Role
    const [userRole] = await db
      .insert(roles)
      .values({
        name: 'User',
        description:
          'Basic user access with read and self-management permissions',
        isSystem: true,
      })
      .onConflictDoNothing()
      .returning()

    if (userRole) {
      // User gets basic read permissions and task management
      const userPermissionSlugs = allPermissions
        .filter(
          (p) =>
            p.slug === 'dashboard.view' ||
            p.slug === 'tasks.read' ||
            p.slug === 'tasks.create' ||
            p.slug === 'tasks.update' ||
            p.slug === 'projects.read' ||
            p.slug === 'settings.manage'
        )
        .map((p) => p.id)

      for (const permissionId of userPermissionSlugs) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: userRole.id,
            permissionId,
          })
          .onConflictDoNothing()
      }

      console.log(`✅ Created User role`)
    }

    // Viewer Role
    const [viewerRole] = await db
      .insert(roles)
      .values({
        name: 'Viewer',
        description: 'Read-only access to view content',
        isSystem: true,
      })
      .onConflictDoNothing()
      .returning()

    if (viewerRole) {
      // Viewer gets only read permissions
      const viewerPermissionSlugs = allPermissions
        .filter((p) => p.action === 'read' || p.slug === 'dashboard.view')
        .map((p) => p.id)

      for (const permissionId of viewerPermissionSlugs) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: viewerRole.id,
            permissionId,
          })
          .onConflictDoNothing()
      }

      console.log(`✅ Created Viewer role`)
    }

    console.log('\n🎉 RBAC seed completed successfully!')
    console.log('\n📋 Summary:')
    console.log(
      '  - 4 system roles created: Super Admin, Administrator, User, Viewer'
    )
    console.log(`  - ${allPermissions.length} permissions created`)
    console.log('\n💡 Next steps:')
    console.log(
      '  1. Assign roles to users using the user management interface'
    )
    console.log('  2. Use the permission checking functions in your code')
    console.log('  3. Update UI components to filter based on permissions')
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error)
    process.exit(1)
  }
}

seed()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
