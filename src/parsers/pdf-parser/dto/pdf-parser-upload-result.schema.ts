import { Type, Static } from '@sinclair/typebox';
import { PdfParserResultSchema } from './pdf-parser-base.schema';


export const PdfParserUploadResultSchema = Type.Intersect([
  PdfParserResultSchema,
  Type.Object({
    originalFileName: Type.String({ 
        description: 'Original file name of the uploaded file' 
    }),
  }),
]);

export type PdfParserUploadResultDto = Static<typeof PdfParserUploadResultSchema>;
