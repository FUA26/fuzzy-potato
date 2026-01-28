import 'dotenv/config'
import { db } from '@/db'
import { users, userRoles, roles } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * List all users in the database with their roles.
 */

async function listUsers() {
  console.log('📋 Listing all users...\n')

  try {
    const allUsers = await db.select().from(users)

    if (allUsers.length === 0) {
      console.log('No users found in database.')
      process.exit(0)
    }

    for (const user of allUsers) {
      console.log(`👤 User:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(`   Username: ${user.username || 'N/A'}`)

      // Get user's roles
      const userRolesData = await db
        .select({
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, user.id))

      if (userRolesData.length === 0) {
        console.log(`   Roles: None (⚠️  no roles assigned)`)
      } else {
        console.log(
          `   Roles: ${userRolesData.map((r) => r.roleName).join(', ')}`
        )
      }
      console.log('')
    }

    console.log(`✅ Total users: ${allUsers.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

listUsers()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
