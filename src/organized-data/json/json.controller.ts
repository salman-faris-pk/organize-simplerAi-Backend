import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JsonService } from './json.service';
import { ISOLogger } from 'src/logger/iso-logger.service';
import {
  ExtractSchemaRouteSchema,
  JsonExtractExampleRouteSchema,
  type JsonExtractExampleDto,
  type JsonExtractSchemaRequestDto,
} from './schema/JsonExtractRequest.schema';
import { RouteConfig } from '@nestjs/platform-fastify';
import { JsonExtractResult } from './schema/jsonExtractResult.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { InvalidJsonOutputError } from './exceptions/exception';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMBadRequestReceivedError,
} from '../llm/exceptions/exceptions';
import { JsonAnalyzeRouteSchema, type JsonAnalyzeRequest} from './schema/jsonAnalyzeRequest.schema';
import { JsonAnalyzeResult } from './schema/jsonAnalyzeResult.Schema';
import{ JsonClassificationRouteSchema, type JsonClassificationRequest } from './schema/jsonClassificationRequest.schema';
import { JsonClassificationResult } from './schema/jsonClassificationResult.schema';
import { JsonGenericOutputRouteSchema, type JsonGenericOutputRequest } from './schema/jsonGenericOuputRequest.schema';
import { JsonGenericOutputResult } from './schema/jsonGenericOutputResult.schema';




@ApiUnauthorizedResponse({
  description: "The API key in request's header is missing or invalid",
})
@ApiUnprocessableEntityResponse({
  description: 'The output is not valid json.',
})
@ApiBadRequestResponse({
  description: 'The request body is invalid or missing',
})
@ApiSecurity('apiKey')
@ApiTags('organized-data')
@Controller({ path: 'organized-data/json', version: '1' })
export class JsonController {
  constructor(
    private readonly jsonService: JsonService,
    private logger: ISOLogger,
  ) {
    this.logger.setContext(JsonController.name);
  }

  @ApiOperation({
    summary: 'Return structured data from text as json using a json schema',
    description: `This endpoint returns organized data from input text as json.
    It accepts a json schema as model for data extraction. The Refine technique can be used for longer texts.\n
    
    Available models: gemeini-2.5-flash-lite,gemeini-2.5-flash`,
  })
  @ApiOkResponse({
    description:
      'The text was successfully organized as json. The output is a valid json object.',
  })
  @ApiBody({
    description:
      'Request body containing text to process as json and extraction parameters.',
  })
  @Post('schema')
  @HttpCode(200)
  @RouteConfig({
    schema: ExtractSchemaRouteSchema,
    preHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const { refine } = req.body as any;

      if (typeof refine === 'object') {
        const isValid =
          Number.isFinite(refine.chunkSize) &&
          Number.isFinite(refine.overlap) &&
          refine.chunkSize > 0 &&
          refine.overlap >= 0 &&
          refine.chunkSize > refine.overlap;

        if (!isValid) {
          return reply.code(400).send({
            error:
              'refine must have chunkSize > overlap and chunkSize > 0, overlap >= 0',
          });
        }
      }
    },
  })
  async extractSchema(@Body() body: JsonExtractSchemaRequestDto) {
    const { jsonSchema, model, text, debug, refine } = body;

    try {
      if (refine) {
        this.logger.debug('refine is true');
        const { debugReport, json, refineRecap } = await this.jsonService.extractWithSchemaAndRefine(
            text,
            model,
            jsonSchema,
            typeof refine === 'object' ? refine : undefined,
            debug,
          );

        const response: JsonExtractResult = {
          model: model.name,
          refine: refineRecap,
          output: JSON.stringify(json),
          debug: debugReport ?? undefined,
        };

        this.logger.debug('Request processed successfully');
        return response;
      } else {
        const { debugReport, json } = await this.jsonService.extractWithSchema(
          text,
          model,
          jsonSchema,
          debug,
        );

        const response: JsonExtractResult = {
          model: model.name,
          refine: false,
          output: JSON.stringify(json),
          debug: debugReport ?? undefined,
        };

        this.logger.debug(
          'Request for json extraction with schema processed successfully',
        );

        return response;
      }
    } catch (err) {
      if (
        err instanceof InvalidJsonOutputError ||
        err instanceof LLMBadRequestReceivedError
      ) {
        this.logger.warn('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(err.message);
      }
      if (
        err instanceof LLMApiKeyMissingError ||
        err instanceof LLMApiKeyInvalidError
      ) {
        this.logger.warn('BadRequestException thrown');
        throw new BadRequestException(err.message);
      }

      this.logger.warn('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
    }
  };



  @ApiOperation({
    summary:
      'Return structured data from text as json using an example of input and output',
    description: `This endpoint returns organized data from input text as json.
    It accepts a fully featured example with a given input text and a desired output json which will be used for data extraction.
    If chunking is needed, the zero-shot variant with a schema is better suited for the task.\n
    
     Available models: gemeini-2.5-flash-lite,gemeini-2.5-flash`,
  })
  @ApiOkResponse({
    description:
      'The text was successfully organized as json. The output is a valid json object.',
  })
  @ApiBody({
    description:
      'Request body containing text to process as json and extraction parameters.',
  })
  @Post('example')
  @RouteConfig({
    schema: JsonExtractExampleRouteSchema
  })
  @HttpCode(200)
  async extractExample(@Body() body: JsonExtractExampleDto) {

      const { exampleInput,exampleOutput,model,text,debug }=body;

      try {
          const { debugReport, json}=await this.jsonService.extractWithExample(
            text,
            model,
            {
              input: exampleInput,
              output: exampleOutput
            },
            debug
          );

          const response: JsonExtractResult ={
             model: model.name,
             refine: false,
             output: JSON.stringify(json),
             debug: debugReport ?? undefined
          };

          this.logger.debug('Request for json extraction with example processed successfully',);

          return response;

      } catch (err) {
        if (err instanceof InvalidJsonOutputError) {
        this.logger.warn(
          `UnprocessableEntityException thrown due to error: ${err.name}`,
        );
        throw new UnprocessableEntityException(err.message);
      }
        this.logger.error('InternalServerErrorException thrown');
        throw new InternalServerErrorException(err.message);
      }
  };




  @ApiOperation({
    summary:
      'Return an analysis of potential errors from a generated json output',
    description: `This endpoint returns an analysis of a generated json output by comparing it to the original text and its json schema.
    It accepts the json output to analyze, the original text and json schema used for data extraction.\n
    
     Available models: gemeini-2.5-flash-lite,gemeini-2.5-flash`,

  })
  @ApiOkResponse({
    description: 'The analysis is successfully returned.',
  })
  @ApiBody({
    description:
      'Request body containing the json schema, the original text and the json output to analyze',
  })
  @Post('analysis')
  @RouteConfig({
    schema: JsonAnalyzeRouteSchema
  })
  @HttpCode(200)
  async analyzeJsonOutput(@Body() body: JsonAnalyzeRequest ){

    const { jsonOutput,jsonSchema,model,originalText,debug }=body;

    try {
        const { debugReport, json: analysis }=await this.jsonService.analyzeJsonOutput(
          model,
          jsonOutput,
          originalText,
          jsonSchema,
          debug
        );

        const response: JsonAnalyzeResult ={
           model: model.name,
           analysis,
           debug: debugReport ?? undefined
        };

        this.logger.debug('Request for analysis processed successfully');
        return response;

    } catch (err) {
      if (err instanceof InvalidJsonOutputError) {
        this.logger.error('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(err.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
    }
  };




  @ApiOperation({
    summary:
      'Return a classification of the given text from a list of possible categories',
    description: `This endpoint returns a classification of a text from a list of possible categories.
    It accepts the text to classify and a list of categories with their descriptions.\n
    
     Available models: gemeini-2.5-flash-lite,gemeini-2.5-flash`,
  })
  @ApiOkResponse({
    description: 'The classification is successfully returned.',
  })
  @ApiBody({    description:
      'Request body containing the text to classify and a list of categories with their descriptions.',
  })
 @Post('classification')
 @RouteConfig({
  schema: JsonClassificationRouteSchema
 })
 @HttpCode(200)
 async classifyText(@Body() body: JsonClassificationRequest){
   
      const { categories,model,text,debug }=body;

      try {
          const { debugReport,json: classification}= await this.jsonService.classifyText(
            model,
            text,
            categories,
            debug
          );

          const response: JsonClassificationResult  ={
             model: model.name,
             classification,
             debug: debugReport ?? undefined 
          };

          this.logger.debug('Request for classification processed successfully');
          return response;

      } catch (err) {
        if (err instanceof InvalidJsonOutputError) {
        this.logger.error('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(err.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
      }
 };




  @ApiOperation({
    summary: 'Return an output from a given prompt',
    description: `This endpoint returns any kind of output from a given prompt
    The generated output is a string available in the json.\n
    
     Available models: gemeini-2.5-flash-lite,gemeini-2.5-flash`,
  })
  @ApiOkResponse({
    description: 'The generic output is successfully returned.',
  })
  @ApiBody({
    description:
      'Request body containing the prompt and the model to use for output generation.',
  })
  @Post('generic-output')
  @RouteConfig({
    schema: JsonGenericOutputRouteSchema
  })
  @HttpCode(200)
  async createGenericOutput(@Body() body:JsonGenericOutputRequest){
     
      const { model,prompt,debug }=body;

      try {
         const {debugReport, json}=await this.jsonService.handleGenericPrompt(
          model,
          prompt,
          debug
         );

         const response: JsonGenericOutputResult ={
              model: model.name,
              output: json.output,
              debug: debugReport ?? undefined
         };

         this.logger.debug('Request for generic output processed successfully')
         return response;
        
      } catch (err) {
        if (err instanceof InvalidJsonOutputError) {
        this.logger.error('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(err.message);
      }
        this.logger.error('InternalServerErrorException thrown');
        throw new InternalServerErrorException(err.message);
      }
  };

};
