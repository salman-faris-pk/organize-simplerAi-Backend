import { Static, Type } from "@sinclair/typebox"
import { DebugReportSchema } from "../../llm/schema/debug.schema"


export const ClassificationSchema = Type.Object({
  classification: Type.String({
    description: 'classification of the text',
  }),

  confidence: Type.String({
    description: 'confidence of the classification in percentage',
  }),
});


export const JsonClassificationResultSchema = Type.Object({
  model: Type.String({
    description: 'model used for classification',
  }),

  classification: ClassificationSchema,

  debug: Type.Optional(DebugReportSchema),
});


export type JsonClassificationResult = Static<typeof JsonClassificationResultSchema>;