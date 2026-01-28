import 'dotenv/config'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

/**
 * Reset feedback tables - DROP and recreate
 * WARNING: This will delete all existing data!
 */

async function resetTables() {
  console.log(
    '⚠️  WARNING: This will DELETE all projects, feedbacks, and webhooks!'
  )
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')

  await new Promise((resolve) => setTimeout(resolve, 5000))

  console.log('🔨 Dropping tables...')

  try {
    // Drop in correct order due to foreign keys
    await db.execute(sql`DROP TABLE IF EXISTS feedbacks CASCADE`)
    console.log('✓ Dropped feedbacks')

    await db.execute(sql`DROP TABLE IF EXISTS webhooks CASCADE`)
    console.log('✓ Dropped webhooks')

    await db.execute(sql`DROP TABLE IF EXISTS projects CASCADE`)
    console.log('✓ Dropped projects')

    console.log('\n✅ Tables dropped successfully!')
    console.log('Run `pnpm db:push` to recreate tables.')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

resetTables()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
