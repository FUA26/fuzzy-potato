import 'dotenv/config'
import { db } from '@/db'
import {
  users,
  userRoles,
  roles,
  permissions,
  rolePermissions,
} from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Check user roles and permissions.
 * Usage: npx tsx db/check-user.ts <email>
 */

async function checkUser(email: string) {
  console.log(`🔍 Checking user: ${email}`)

  try {
    // Find user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (userResult.length === 0) {
      console.error(`❌ User with email "${email}" not found`)
      process.exit(1)
    }

    const user = userResult[0]
    console.log(`✅ Found user:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name || 'N/A'}`)

    // Check user's roles
    console.log('\n👥 Checking user roles...')
    const userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id))

    if (userRolesData.length === 0) {
      console.log('⚠️  User has no roles assigned')
      console.log('💡 To assign a role, run: pnpm db:assign-admin <email>')
    } else {
      console.log(`✅ User has ${userRolesData.length} role(s):`)
      userRolesData.forEach((role) => {
        console.log(
          `   - ${role.roleName}: ${role.roleDescription || 'No description'}`
        )
      })
    }

    // Test permissions query
    console.log('\n🔐 Testing permissions query...')
    try {
      const userPermissions = await db
        .select({
          slug: permissions.slug,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id)
        )
        .where(eq(userRoles.userId, user.id))

      console.log(`✅ Permissions query succeeded`)
      console.log(`   Found ${userPermissions.length} permission(s)`)
      if (userPermissions.length > 0) {
        console.log(
          '   Permissions:',
          userPermissions.map((p) => p.slug).join(', ')
        )
      }
    } catch (error) {
      console.error('❌ Permissions query failed:', error)
      if (error instanceof Error) {
        console.error('   Message:', error.message)
        console.error('   Stack:', error.stack)
      }
    }

    // Check database state
    console.log('\n📊 Database state:')
    const [userCount, roleCount, permissionCount, userRoleCount] =
      await Promise.all([
        db
          .select({ count: users.id })
          .from(users)
          .then((r) => r.length),
        db
          .select({ count: roles.id })
          .from(roles)
          .then((r) => r.length),
        db
          .select({ count: permissions.id })
          .from(permissions)
          .then((r) => r.length),
        db
          .select({ count: userRoles.userId })
          .from(userRoles)
          .then((r) => r.length),
      ])

    console.log(`   Users: ${userCount}`)
    console.log(`   Roles: ${roleCount}`)
    console.log(`   Permissions: ${permissionCount}`)
    console.log(`   User-Role assignments: ${userRoleCount}`)

    console.log('\n✅ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: npx tsx db/check-user.ts <email>')
  process.exit(1)
}

checkUser(email)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
