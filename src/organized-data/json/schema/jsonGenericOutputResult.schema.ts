import { Static, Type } from "@sinclair/typebox";
import { DebugReportSchema } from "../../llm/schema/debug.schema"



export const JsonGenericOutputResultSchema = Type.Object({
  model: Type.String({
    description: 'model used for generic prompt completion',
  }),

  output: Type.String({
    description: 'generic output as string',
  }),

  debug: Type.Optional(DebugReportSchema),
});


export type JsonGenericOutputResult = Static<typeof JsonGenericOutputResultSchema>;