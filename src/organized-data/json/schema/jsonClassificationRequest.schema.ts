import { Type, Static } from '@sinclair/typebox';
import { JsonClassificationResultSchema } from './jsonClassificationResult.schema';


export const ClassificationModelSchema = Type.Object({
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


export const JsonClassificationRequestSchema = Type.Object({
    
  model: ClassificationModelSchema,

  categories: Type.Array(Type.String(), {
    description: 'categories to classify the text into',
    minItems: 1,
  }),

  text: Type.String({
    description: 'text to classify',
    minLength: 1,
  }),

  debug: Type.Optional(
    Type.Boolean({
      description:
        'if a debug report of the classification should be generated',
      default: false,
    }),
  ),
});

export type JsonClassificationRequest = Static<
  typeof JsonClassificationRequestSchema
>;


export const JsonClassificationRouteSchema ={
   body: JsonClassificationRequestSchema,
   response: { 200: JsonClassificationResultSchema },
};