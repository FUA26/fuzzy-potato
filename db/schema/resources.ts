import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const resources = pgTable('resources', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  identifier: varchar('identifier', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
    () => new Date()
  ),
})

export type Resource = typeof resources.$inferSelect
export type NewResource = typeof resources.$inferInsert
