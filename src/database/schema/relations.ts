import { relations } from "drizzle-orm"
import { apiKeys } from "./api-key.schema"
import { applications } from "./application.schema"


// ApiKey → Application relation
export const apiKeysRelations = relations(apiKeys, ({ one }) => (
    {
    application: one(applications, {
        fields: [apiKeys.applicationId],
        references: [applications.id],
    }),
    }
));


// Application → ApiKey[] relation
export const applicationsRelations = relations(applications, ({ many }) => (
    {
        ApiKeys: many(apiKeys)
    }
))
