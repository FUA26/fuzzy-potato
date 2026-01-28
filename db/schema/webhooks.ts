import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { projects } from './projects'

/**
 * Webhooks table - Third-party integrations (Pro feature)
 *
 * Stores webhook configurations for sending real-time notifications
 * when feedback events occur.
 */
export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: text('events')
    .array()
    .notNull()
    .default(sql`ARRAY[]::TEXT[]`), // ['feedback.created', 'feedback.alert']
  isActive: boolean('is_active').notNull().default(true),
  secretKey: varchar('secret_key', { length: 100 }), // For signature verification
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export type Webhook = typeof webhooks.$inferSelect
export type NewWebhook = typeof webhooks.$inferInsert
