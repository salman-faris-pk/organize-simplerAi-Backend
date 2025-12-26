import { pgTable,uuid,varchar,timestamp,text } from "drizzle-orm/pg-core";


export const applications = pgTable('applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at', { mode: 'date'}).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date'}).notNull().defaultNow(),
});
