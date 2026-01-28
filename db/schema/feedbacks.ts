import {
  pgTable,
  uuid,
  varchar,
  smallint,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { projects } from './projects'

/**
 * Feedbacks table - High-volume transaction table
 *
 * Designed for write-heavy (many incoming submissions) and read-heavy (dashboard analytics).
 * Uses hybrid approach: relational columns for indexing + JSONB for flexible data.
 */
export const feedbacks = pgTable(
  'feedbacks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),

    // PRIMARY METRICS (Indexed for Dashboard Speed)
    rating: smallint('rating').notNull(), // 1 to 5
    status: varchar('status', { length: 20 }).notNull().default('new'), // 'new', 'read', 'archived'

    // DYNAMIC DATA
    answers: jsonb('answers').$type<{
      tags?: string[]
      comment?: string
      email?: string
    }>(),
    meta: jsonb('meta').$type<{
      url?: string
      os?: string
      browser?: string
      geo?: string
      device_type?: 'mobile' | 'tablet' | 'desktop'
      user_agent?: string
    }>(),

    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    // Composite Index for Dashboard - Speed up "latest feedback" queries
    projectDateIdx: index('idx_feedbacks_project_date').on(
      table.projectId,
      table.createdAt
    ),

    // Index for Rating Metrics - Speed up CSAT/Average Rating calculations
    projectRatingIdx: index('idx_feedbacks_project_rating').on(
      table.projectId,
      table.rating
    ),

    // Note: GIN index for answers column will be added manually in migration
    // to enable fast JSONB queries like filtering by tags
  })
)

export type Feedback = typeof feedbacks.$inferSelect
export type NewFeedback = typeof feedbacks.$inferInsert
