import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core'

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(), // e.g., "users.create", "posts.delete"
  description: text('description'),
  resource: varchar('resource', { length: 50 }).notNull(), // e.g., "users", "posts", "settings"
  action: varchar('action', { length: 50 }).notNull(), // e.g., "create", "read", "update", "delete"
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
    () => new Date()
  ),
})

export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert
