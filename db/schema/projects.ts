import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

/**
 * Projects table - Stores widget configuration and feature limits
 *
 * This table is the "brain" of each feedback widget.
 * It stores the Logic Builder configuration and security settings.
 */
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),

  // SECURITY
  domainWhitelist: text('domain_whitelist')
    .array()
    .notNull()
    .default(sql`ARRAY[]::TEXT[]`),
  apiKey: varchar('api_key', { length: 64 }).unique(),

  // CONFIGURATION (The Brain)
  widgetConfig: jsonb('widget_config')
    .default(sql`'{}'::jsonb`)
    .$type<{
      theme?: {
        color_primary?: string
        position?: 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right'
        trigger_label?: string
      }
      logic?: Array<{
        rating_group: number[]
        title: string
        tags: string[]
        placeholder: string
        collect_email: boolean
        cta_redirect?: string
      }>
    }>(),

  // FEATURE GATING (Model Unlimited)
  tier: varchar('tier', { length: 20 }).notNull().default('basic'), // 'basic', 'pro', 'enterprise'
  settings: jsonb('settings')
    .default(sql`'{"remove_branding": false, "retention_days": 30}'::jsonb`)
    .$type<{
      remove_branding?: boolean
      retention_days?: number
    }>(),

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
    () => new Date()
  ),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
