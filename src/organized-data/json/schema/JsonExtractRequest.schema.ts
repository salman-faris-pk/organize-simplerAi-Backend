import { Type, Static } from '@sinclair/typebox';



export const JsonExtractRequestSchema = Type.Object({
      text: Type.String({ minLength: 1}),

      model: Type.Object({
        apiKey: Type.Optional(Type.String()),
        name: Type.String({ default: 'gemini-2.5-flash-lite'})
      }),

      debug: Type.Optional(Type.Boolean({
         default: false,
         description: 'if a debug report of the json extraction should be generated',
      }))
});



export const RefineParamsSchema = Type.Object(
    {
         chunkSize: Type.Number({
            minimum: 1,
            description: 'size of chunks to split the document into',
            default: 2000
         }),
         overlap: Type.Number({
            minimum: 0,
            description: 'overlap between chunks',
            default: 100
         }),
    },
    {
       additionalProperties: false
    }
);

export const RefineSChema = Type.Union([
    Type.Boolean({
        description: 'enable or disable refine multi-step extraction',
        default: false,
    }),
    RefineParamsSchema
]);


export const SchemaRequestSchema= Type.Object({
     jsonSchema: Type.String({
        format: 'json',
        description: 'json schema to use as model for data extraction'
     }),
     refine: Type.Optional(RefineSChema)
});

export const ExampleRequestSchema =Type.Object({
    exampleInput: Type.String({ minLength: 1}),
    exampleOutput: Type.String({ format: 'json' }),
});



export const JsonExtractSchemaRequest = Type.Intersect([
    JsonExtractRequestSchema,
    SchemaRequestSchema
]);

export type JsonExtractResultDto = Static<typeof JsonExtractSchemaRequest>


export const JsonExtractExampleRequest = Type.Intersect([
    JsonExtractRequestSchema,
    ExampleRequestSchema
]);

export type JsonExtractExampleDto = Static<typeof JsonExtractExampleRequest>;


