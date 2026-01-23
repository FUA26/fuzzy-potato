import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
} from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').notNull().default(false), // System roles cannot be deleted
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
    () => new Date()
  ),
})

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
