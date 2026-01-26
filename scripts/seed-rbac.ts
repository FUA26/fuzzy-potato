import 'dotenv/config'
import { db } from '@/db'
import { roles } from '@/db/schema/roles'
import { permissions } from '@/db/schema/permissions'
import { rolePermissions } from '@/db/schema/role-permissions'

/**
 * Seed RBAC (Role-Based Access Control) data
 *
 * This script creates:
 * - System roles: Admin, Editor, Viewer
 * - Permissions for common resources (users, posts, roles, permissions, settings)
 * - Role-permission associations
 */

const resources = ['users', 'posts', 'roles', 'permissions', 'settings']
const actions = ['create', 'read', 'update', 'delete', 'manage']

async function seed() {
  console.log('🌱 Starting RBAC seed...')

  try {
    // Create roles
    console.log('📋 Creating roles...')

    const adminRole = await db
      .insert(roles)
      .values({
        name: 'Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
      })
      .returning()
      .then((res) => res[0])

    const editorRole = await db
      .insert(roles)
      .values({
        name: 'Editor',
        description: 'Can manage content but not system settings',
        isSystem: true,
      })
      .returning()
      .then((res) => res[0])

    const viewerRole = await db
      .insert(roles)
      .values({
        name: 'Viewer',
        description: 'Read-only access to most resources',
        isSystem: true,
      })
      .returning()
      .then((res) => res[0])

    console.log(
      `  ✓ Created roles: ${adminRole.name}, ${editorRole.name}, ${viewerRole.name}`
    )

    // Create permissions
    console.log('🔐 Creating permissions...')

    const allPermissions: string[] = []

    for (const resource of resources) {
      for (const action of actions) {
        const permission = await db
          .insert(permissions)
          .values({
            name: `${resource.charAt(0).toUpperCase() + resource.slice(1)} ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            slug: `${resource}.${action}`,
            resource,
            action,
            description: `Allow ${action} access to ${resource}`,
          })
          .onConflictDoNothing()
          .returning()
          .then((res) => res[0])

        if (permission) {
          allPermissions.push(permission.id)
        }
      }
    }

    console.log(`  ✓ Created ${allPermissions.length} permissions`)

    // Fetch all permissions
    const allPermissionsList = await db.select().from(permissions)
    console.log(
      `  ✓ Total permissions in database: ${allPermissionsList.length}`
    )

    // Assign all permissions to Admin
    console.log('🔗 Assigning permissions to roles...')

    for (const permission of allPermissionsList) {
      await db
        .insert(rolePermissions)
        .values({
          roleId: adminRole.id,
          permissionId: permission.id,
        })
        .onConflictDoNothing()
    }

    console.log(`  ✓ Admin: ${allPermissionsList.length} permissions`)

    // Assign limited permissions to Editor (posts and users read/update)
    const editorPermissions = allPermissionsList.filter(
      (p) =>
        p.resource === 'posts' ||
        (p.resource === 'users' && p.action === 'read') ||
        (p.resource === 'users' && p.action === 'update')
    )

    for (const permission of editorPermissions) {
      await db
        .insert(rolePermissions)
        .values({
          roleId: editorRole.id,
          permissionId: permission.id,
        })
        .onConflictDoNothing()
    }

    console.log(`  ✓ Editor: ${editorPermissions.length} permissions`)

    // Assign read-only permissions to Viewer
    const viewerPermissions = allPermissionsList.filter(
      (p) => p.action === 'read'
    )

    for (const permission of viewerPermissions) {
      await db
        .insert(rolePermissions)
        .values({
          roleId: viewerRole.id,
          permissionId: permission.id,
        })
        .onConflictDoNothing()
    }

    console.log(`  ✓ Viewer: ${viewerPermissions.length} permissions`)

    console.log('\n✅ RBAC seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`  - 3 system roles created`)
    console.log(`  - ${allPermissionsList.length} permissions created`)
    console.log(`  - Role-permission associations created`)
  } catch (error) {
    console.error('❌ Error seeding RBAC data:', error)
    process.exit(1)
  }
}

seed()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
