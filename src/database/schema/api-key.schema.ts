import { pgTable, uuid,timestamp } from "drizzle-orm/pg-core";
import { applications } from "./application.schema";



export const apiKeys = pgTable('api_keys', {
    id: uuid('id').primaryKey().defaultRandom(),
    applicationId: uuid('application_id').notNull().references(() => applications.id , { onDelete: 'cascade'}),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})