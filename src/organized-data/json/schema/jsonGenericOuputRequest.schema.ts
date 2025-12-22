import { Type, Static } from '@sinclair/typebox';


export const GenericOutputModelSchema = Type.Object({
  apiKey: Type.Optional(
    Type.String({
      description: 'api key of the model',
    }),
  ),

  name: Type.String({
    description: 'name of the model',
    default: 'gemini-2.5-flash-lite',
  }),
});


export const JsonGenericOutputRequestSchema = Type.Object({
  model: GenericOutputModelSchema,

  prompt: Type.String({
    description: 'prompt to provide to the model',
    minLength: 1,
  }),

  debug: Type.Optional(
    Type.Boolean({
      description:
        'if a debug report of the generic output generation should be generated',
      default: false,
    }),
  ),
});


export type JsonGenericOutputRequest = Static<typeof JsonGenericOutputRequestSchema>;