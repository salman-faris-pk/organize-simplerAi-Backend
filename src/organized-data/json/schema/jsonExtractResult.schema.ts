import { DebugReportSchema } from "../../llm/schema/debug.schema"
import { Type, Static } from '@sinclair/typebox';



export const RefineRecapSchema = Type.Object(
  {
    chunkSize: Type.Number({
      description: 'size of the chunks',
      default: 2000,
      minimum: 1,
    }),

    overlap: Type.Number({
      description: 'overlap between chunks',
      default: 100,
      minimum: 0,
    }),

    llmCallCount: Type.Number({
      description: 'number of calls to the model',
      minimum: 0,
    }),
  },
  {
    additionalProperties: false,
  },
);


export const JsonExtractResultSchema = Type.Object({
  model: Type.String({
    description: 'model used for data extraction',
  }),

  refine: Type.Union(
    [
      Type.Boolean({
        description: 'refine technique is not used',
        default: false,
      }),
      RefineRecapSchema,
    ],
    {
      description: 'refine recap information',
    },
  ),

  output: Type.String({
    description: 'organized data extracted from text as json',
  }),

  debug: Type.Optional(DebugReportSchema),
});


export type JsonExtractResult = Static<
  typeof JsonExtractResultSchema
>;