import type { MultipartFile } from '@fastify/multipart';
import { BadRequestException, Controller, HttpCode, Post, Req, UnprocessableEntityException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { PdfParserService } from './pdf-parser.service';
import { PdfParserUploadResultDto, PdfParserUploadResultSchema } from './schemas/pdf-parser-upload-result.schema';
import{ PdfParserRequestDto, PdfParserRequestSchema, PdfParserUrlResultDto, PdfParserUrlResultSchema } from './schemas/pdf-parser-base.schema';
import { PdfSizeError } from "./exceptions/exceptions"
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
    description:"The API key in request's header is missing or invalid",
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
          The file must be a PDF parsable text context, with a maximum size of 5MB.
         `,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: uploadSchema, description:"PDF file to be parsed"})
    @Post('upload')
    @RouteConfig({
      schema: UploadRouteSchema,
    })
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
         throw new PdfSizeError(5);
       }

        try {

          const buffer = await file.toBuffer();

         const text=await this.pdfParserService.parsePdf(buffer);

         return {
          originalFileName: file.filename,
          content: text
         };

         } catch (err) {
         throw new UnprocessableEntityException(err.message);
       }
    };




   
    @ApiOperation({
    summary: 'Return text from PDF file provided by URL',
    description: `This endpoint retrieves the content of an PDF file available through an URL and returns it as a text.\n
      The file must be a PDF parsable text context, with a maximum size of 10MB`,
    })
    @ApiOkResponse({
      schema: PdfParserUrlResultSchema,
      description:'The PDF was parsed and post-processed successfully. Its content is returned as text.',
    })
    @ApiBody({
     schema: PdfParserRequestSchema,
    })
    @Post('url')
    @RouteConfig({
      schema: UrlRouteSchema
    })
    @HttpCode(200)
    async parsePdfFromUrl(
      @Req() req:FastifyRequest<{Body: PdfParserRequestDto}>
    ) : Promise<PdfParserUrlResultDto> {
  
      const { url } = req.body;

      const file= await this.pdfParserService.loadPdfFromUrl(url);
      const text=await this.pdfParserService.parsePdf(file);

      return {
        originalUrl: url,
        content: text
      };

    };
};
