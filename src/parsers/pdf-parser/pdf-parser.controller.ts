import type { MultipartFile } from '@fastify/multipart';
import { BadRequestException, Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { PdfParserService } from './pdf-parser.service';
import { PdfParserUploadResultDto, PdfParserUploadResultSchema } from './dto/pdf-parser-upload-result.schema';
import type{ PdfParserRequestDto, PdfParserUrlResultDto } from './dto/pdf-parser-base.schema';


const uploadSchema={
    type: 'object',
    required: ['file'],
    properties: {
        file:{
            type: 'string',
            format: "binary"
        }
    }
};

@ApiUnauthorizedResponse({
    description:"The API ket in request's header is missing or invalid",
})
@ApiBadRequestResponse({
    description:"The request body or the uploaded file is invalid or missing"
})
@ApiUnprocessableEntityResponse({
    description:"The PDF does not contain plain text or information in text format."
})
@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path:'parsers/pdf', version:'1'})
export class PdfParserController {

  constructor(private readonly pdfParserService:PdfParserService){}

    @ApiOkResponse({
    schema: PdfParserUploadResultSchema,
    description:
      'The PDF was parsed and post-processed successfully. Its content is returned as text.',
    })
    @ApiOperation({
        summary:'Return text from uploaded PDF file',
        description: `This endpoint retrieves the content of an uploaded PDF file and returns it as a text.\n
          The file must be a PDF parsable text context, with a maximum size of 10MB.
         `,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: uploadSchema, description:"PDF file to be parsed"})
    @Post('upload')
    @HttpCode(200)
    async parsePdfFromUpload(@Req() req: FastifyRequest): Promise<PdfParserUploadResultDto> {
       
        const file: MultipartFile | undefined = await req.file();

       if (!file) {
         throw new BadRequestException('File is required');
       }

       if (file.mimetype !== 'application/pdf') {
         throw new BadRequestException('Only PDF files allowed');
       }

       if (file.file.truncated) {
         throw new BadRequestException('File too large (max 10MB)');
       }

       const buffer = await file.toBuffer();

         const text=await this.pdfParserService.parsePdf(buffer);
         return {
          originalFileName: file.filename,
          content: text
         };
    };




   
    @ApiOperation({
    summary: 'Return text from PDF file provided by URL',
    description: `This endpoint retrieves the content of an PDF file available through an URL and returns it as a text.\n
      The file must be a PDF parsable text context, with a maximum size of 10MB`,
    })
    @ApiOkResponse({
      schema: PdfParserUploadResultSchema,
      description:'The PDF was parsed and post-processed successfully. Its content is returned as text.',
    })
    @Post('url')
    @HttpCode(200)
    async parsePdfFromUrl(
      @Body() requestDto: PdfParserRequestDto, 
    ) : Promise<PdfParserUrlResultDto> {
       
      const file= await this.pdfParserService.loadPdfFromUrl(requestDto.url);
      const text=await this.pdfParserService.parsePdf(file);

      return {
        originalUrl: requestDto.url,
        content: text
      };



    };
};
