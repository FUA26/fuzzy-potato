import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  username: varchar('username', { length: 50 }).unique(),
  provider: varchar('provider', { length: 255 }),
  keycloakId: varchar('keycloak_id', { length: 255 }),
  password: varchar('password', { length: 255 }).notNull(),
  image: text('image'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  emailVerifiedToken: varchar('email_verified_token', { length: 255 }),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$onUpdate(
    () => new Date()
  ),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
