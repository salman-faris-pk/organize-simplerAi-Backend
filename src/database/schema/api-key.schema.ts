import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';


export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  apiKey: text('api_key'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  githubId: varchar('github_id', { length: 255 }),
});