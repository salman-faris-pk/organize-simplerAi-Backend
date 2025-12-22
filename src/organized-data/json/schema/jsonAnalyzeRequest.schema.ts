import { Type, Static } from '@sinclair/typebox';



const AnalysisModelSchema = Type.Object({
    apiKey: Type.Optional(Type.String({
        description: 'api key of the model'
    })),
    name: Type.String({
    description: 'name of the model',
    default: 'gemini-2.5-flash-lite',
  }),
});


export const JsonAnalyzeRequestSchema = Type.Object({
      model: AnalysisModelSchema,

       originalText: Type.String({
    description: 'original text from which the json was generated',
    minLength: 1,
  }),

  jsonOutput: Type.String({
    description: 'json output from the data extraction',
    minLength: 1,
  }),

  jsonSchema: Type.String({
    description: 'json schema used as model for data extraction',
    minLength: 1,
  }),

  debug: Type.Optional(
    Type.Boolean({
      description: 'if a debug report of the analysis should be generated',
      default: false,
    }),
   ),

});

export type JsonAnalyzeRequest = Static<typeof JsonAnalyzeRequestSchema>