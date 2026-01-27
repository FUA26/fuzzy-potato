import { db } from '@/db'
import { users, roles, userRoles } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Assign Administrator role to a user by email.
 *
 * Usage: npx tsx db/assign-admin.ts <email>
 * Example: npx tsx db/assign-admin.ts test@mail.com
 */

async function assignAdminRole(email: string) {
  console.log(`🔑 Assigning Admin role to user: ${email}`)

  try {
    // Find user by email
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
    console.log(`✅ Found user: ${user.name || user.email} (ID: ${user.id})`)

    // Find Administrator role
    const roleResult = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'Super Admin'))
      .limit(1)

    if (roleResult.length === 0) {
      console.error(
        '❌ Super Admin role not found. Please run "pnpm db:seed" first.'
      )
      process.exit(1)
    }

    const adminRole = roleResult[0]
    console.log(`✅ Found role: ${adminRole.name} (ID: ${adminRole.id})`)

    // Check if user already has this role
    const existingRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))

    const hasRole = existingRole.some((ur) => ur.roleId === adminRole.id)

    if (hasRole) {
      console.log(
        `⚠️  User "${email}" already has the "${adminRole.name}" role`
      )
      process.exit(0)
    }

    // Assign role to user
    await db.insert(userRoles).values({
      userId: user.id,
      roleId: adminRole.id,
    })

    console.log(
      `🎉 Successfully assigned "${adminRole.name}" role to "${email}"`
    )
    console.log(
      '\n📋 User now has access to all permissions (including wildcard * permission)'
    )
  } catch (error) {
    console.error('❌ Error assigning admin role:', error)
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: npx tsx db/assign-admin.ts <email>')
  console.error('   Example: npx tsx db/assign-admin.ts test@mail.com')
  process.exit(1)
}

assignAdminRole(email)
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
