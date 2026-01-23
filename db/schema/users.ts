import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  username: varchar('username', { length: 50 }).unique(),
  image: text('image'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
    () => new Date()
  ),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
