import { Type, Static } from '@sinclair/typebox';


export const PdfParserRequestSchema = Type.Object({
  url: Type.String({ 
    format: 'uri', 
    description: 'URL of the PDF file to parse' 
}),
});
export type PdfParserRequestDto = Static<typeof PdfParserRequestSchema>;



export const PdfParserResultSchema = Type.Object({
  content: Type.String({
     description: 'Parsed and post-processed content of the PDF file'
     }),
});
export type PdfParserResultDto = Static<typeof PdfParserResultSchema>;


export const PdfParserUrlResultSchema = Type.Intersect([
  PdfParserResultSchema,
  Type.Object({
    originalUrl: Type.String({ 
        format: 'uri',
        description: 'Original URL of the PDF file' 
    }),
  }),
]);


//for response promise
export type PdfParserUrlResultDto = Static<typeof PdfParserUrlResultSchema>;
