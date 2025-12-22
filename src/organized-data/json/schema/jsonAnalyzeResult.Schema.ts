import { Static, Type } from "@sinclair/typebox"
import { DebugRepostSchema } from "../../llm/schema/debug.schema"



export const CorrectionSchema = Type.Object({

  field: Type.String({
    description: 'field that needs to be corrected',
  }),

  issue: Type.String({
    description: 'issue found in the field',
  }),

  description: Type.String({
    description: 'description of the issue and why it is a problem',
  }),

  suggestion: Type.String({
    description: 'suggestion for how to correct the issue',
  }),
});

export const AnalysisSchema = Type.Object({
  corrections: Type.Array(CorrectionSchema, {
    description: 'list of corrections',
  }),

  textAnalysis: Type.String({
    description: 'full textual analysis of the issue',
  }),
});


export const JsonAnalyzeResultSchema = Type.Object({
  model: Type.String({
    description: 'model used for the analysis',
  }),

  analysis: AnalysisSchema,

  debug: Type.Optional(
     DebugRepostSchema,
  ),
});


export type JsonAnalyzeResult = Static<typeof JsonAnalyzeResultSchema>;
