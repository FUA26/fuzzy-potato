import { db } from '@/db'
import { resources } from '@/db/schema'

/**
 * Seed default resources for the RBAC system.
 *
 * Run with: npx tsx db/seed-resources.ts
 */

const defaultResources = [
  {
    name: 'Dashboard',
    identifier: 'dashboard',
    description: 'Main dashboard and analytics',
  },
  {
    name: 'Users',
    identifier: 'users',
    description: 'User management and authentication',
  },
  {
    name: 'Roles',
    identifier: 'roles',
    description: 'Role definitions and management',
  },
  {
    name: 'Permissions',
    identifier: 'permissions',
    description: 'Permission definitions and management',
  },
  {
    name: 'Tasks',
    identifier: 'tasks',
    description: 'Task and project management',
  },
  {
    name: 'Projects',
    identifier: 'projects',
    description: 'Project management and tracking',
  },
  {
    name: 'Posts',
    identifier: 'posts',
    description: 'Blog posts and content management',
  },
  {
    name: 'Settings',
    identifier: 'settings',
    description: 'System settings and configuration',
  },
  {
    name: 'Reports',
    identifier: 'reports',
    description: 'System reports and analytics',
  },
  {
    name: 'Audit Logs',
    identifier: 'audit',
    description: 'System audit logs and history',
  },
  {
    name: 'System',
    identifier: 'system',
    description: 'System-level operations and maintenance',
  },
]

async function seed() {
  console.log('🌱 Starting Resources seed...')

  try {
    // Insert resources
    console.log('📝 Inserting resources...')
    const insertedResources = await db
      .insert(resources)
      .values(defaultResources)
      .onConflictDoNothing()
      .returning()

    console.log(`✅ Inserted ${insertedResources.length} resources`)
    console.log('\n📋 Resources created:')
    insertedResources.forEach((resource) => {
      console.log(`  - ${resource.name} (${resource.identifier})`)
    })

    console.log('\n🎉 Resources seed completed successfully!')
    console.log('\n💡 Next steps:')
    console.log('  1. Update permissions to reference these resources')
    console.log('  2. Use the Resources management page to add more resources')
  } catch (error) {
    console.error('❌ Error seeding resources:', error)
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
