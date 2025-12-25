import { BadRequestException, Body, Controller, HttpCode, InternalServerErrorException, PayloadTooLargeException, Post, Req, UnprocessableEntityException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { PdfParserService } from './pdf-parser.service';
import { PdfParserUploadResultDto, PdfParserUploadResultSchema } from './schemas/pdf-parser-upload-result.schema';
import{ type PdfParserRequestDto, PdfParserRequestSchema, PdfParserUrlResultDto, PdfParserUrlResultSchema } from './schemas/pdf-parser-base.schema';
import { PdfNotParsedError, PdfSizeError } from "./exceptions/exceptions"
import { UrlRouteSchema,UploadRouteSchema} from "../pdf-parser/schemas/pdf-parser.route-schema"
import { RouteConfig } from '@nestjs/platform-fastify';

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


@ApiResponse({
  status: 413,
  description: 'PDF file is larger than 5MB',
})
@ApiResponse({
  status: 422,
  description: 'PDF file could not be parsed',
})
@ApiUnauthorizedResponse({
  description: "The API key in request's header is missing or invalid",
})
@ApiBadRequestResponse({
  description: 'The request body or the uploaded file is invalid or missing',
})
@ApiUnprocessableEntityResponse({
  description:
    'The PDF does not contain plain text or information in text format.',
})
@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parsers/pdf', version: '1' })
export class PdfParserController {
  constructor(private readonly pdfParserService: PdfParserService) {}

  @ApiOkResponse({
    schema: PdfParserUploadResultSchema,
    description:
      'The PDF was parsed and post-processed successfully. Its content is returned as text.',
  })
  @ApiOperation({
    summary: 'Return text from uploaded PDF file',
    description: `This endpoint retrieves the content of an uploaded PDF file and returns it as a text.\n
          The file must be a PDF parsable text context, with a maximum size of 5MB.
         `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema, description: 'PDF file to be parsed' })
  @Post('upload')
  @RouteConfig({
    schema: UploadRouteSchema
  })
  @HttpCode(200)
  async parsePdfFromUpload(@Req() req: FastifyRequest,
  ): Promise<PdfParserUploadResultDto> {
    
      const file = await req.file();

      if (!file) {
        throw new BadRequestException('File is required');
      }

      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Only PDF files allowed');
      }

      if (file.file.truncated) {
        throw new PayloadTooLargeException('PDF file is larger than 5MB');
      }
       
      const buffer = await file.toBuffer(); 

    try {

      const text = await this.pdfParserService.parsePdf(buffer);

      return {
        originalFileName: file.filename,
        content: text,
      };
    } catch (err) {
      if (err instanceof PdfNotParsedError) {
        throw new UnprocessableEntityException(err.message);
      }
      throw new InternalServerErrorException('Failed to parse file');
    }
  }

  @ApiOperation({
    summary: 'Return text from PDF file provided by URL',
    description: `This endpoint retrieves the content of an PDF file available through an URL and returns it as a text.\n
      The file must be a PDF parsable text context, with a maximum size of 10MB`,
  })
  @ApiOkResponse({
    schema: PdfParserUrlResultSchema,
    description:
      'The PDF was parsed and post-processed successfully. Its content is returned as text.',
  })
  @ApiBody({
    schema: PdfParserRequestSchema,
  })
  @Post('url')
  @RouteConfig({
    schema: UrlRouteSchema,
  })
  @HttpCode(200)
  async parsePdfFromUrl(@Body() body: PdfParserRequestDto
  ): Promise<PdfParserUrlResultDto> {
    try {
      
      const { url } = body;

      const file = await this.pdfParserService.loadPdfFromUrl(url);
      const text = await this.pdfParserService.parsePdf(file);

      return {
        originalUrl: url,
        content: text,
      };
    } catch (err) {
      if (err instanceof PdfNotParsedError) {
        throw new UnprocessableEntityException(err.message);
      }
      if (err instanceof PdfSizeError) {
        throw new PayloadTooLargeException(err.message);
      }

      throw new InternalServerErrorException('Failed to parse PDF file');
    }
  }

};
