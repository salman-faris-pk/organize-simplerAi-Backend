import { Type } from '@sinclair/typebox';
import {
  PdfParserRequestSchema,
  PdfParserUrlResultSchema,
} from './pdf-parser-base.schema';
import { PdfParserUploadResultSchema } from "./pdf-parser-upload-result.schema"



export const UploadRouteSchema = {
  summary: 'Extract text from uploaded PDF',
  description: 'Upload a PDF file and extract text content (max 5MB)',
  tags: ['pdf', 'parsers'],
  consumes: ['multipart/form-data'],
  body: Type.Object({
    file: Type.String({
      format: 'binary',
      description: 'PDF file (max 5MB)',
    }),
  }),
  response: {
    200: PdfParserUploadResultSchema,
    400: Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      error: Type.String(),
    }),
    413: Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      error: Type.String(),
    }),
  },
};


export const UrlRouteSchema = {
  summary: 'Extract text from PDF via URL',
  description: 'Downloads PDF from URL and extracts text content',
  tags: ['pdf', 'parsers'],
  body: PdfParserRequestSchema,
  response: {
    200: PdfParserUrlResultSchema,
    400: Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      error: Type.String(),
    }),
    422: Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      error: Type.String(),
    }),
  },
};

