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
import { JsonAnalyzeRouteSchema, type JsonAnalyzeRequest } from './schema/jsonAnalyzeRequest.schema';
import { JsonAnalyzeResult } from './schema/jsonAnalyzeResult.Schema';
import { JsonClassificationRouteSchema, type JsonClassificationRequest } from './schema/jsonClassificationRequest.schema';
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
    private readonly logger: ISOLogger,
  ) {
    this.logger.setContext(JsonController.name);
  }


  @ApiOperation({
    summary: 'Return structured data from text as json using a json schema',
    description: `This endpoint returns organized data from input text as json.
                  It accepts a json schema as model for data extraction. The Refine technique can be used for longer texts.`,
  })
  @ApiOkResponse({ description: 'The text was successfully organized as json.' })
  @ApiBody({ description: 'Request body containing text and extraction parameters.' })
  @Post('schema')
  @HttpCode(200)
  @RouteConfig({
    schema: ExtractSchemaRouteSchema,
    preHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const body = req.body as JsonExtractSchemaRequestDto;
      if (typeof body.refine === 'object') {
         const { chunkSize, overlap } = body.refine;
        const isValid =
          Number.isFinite(chunkSize) &&
          Number.isFinite(overlap) &&
          chunkSize > 0 &&
          overlap >= 0 &&
          chunkSize > overlap;

        if (!isValid) {
          return reply.code(400).send({
            error: 'refine must have chunkSize > overlap and chunkSize > 0, overlap >= 0',
          });
        }
      }
    },
  })
  async extractSchema(@Body() body: JsonExtractSchemaRequestDto) {
    const { jsonSchema, model, text, debug, refine } = body;

    try {
      if (refine) {
        this.logger.debug('Refine mode enabled');
        const { json, debugReport, refineRecap } = await this.jsonService.extractWithSchemaAndRefine(
            text,
            model,
            jsonSchema,
            typeof refine === 'object' ? refine : undefined,
            debug,
          );

        return {
          model: model.name,
          refine: refineRecap,
          output: JSON.stringify(json),
          debug: debugReport ?? undefined,
        } as JsonExtractResult;

      } else {
        const { json, debugReport } = await this.jsonService.extractWithSchema(
          text,
          model,
          jsonSchema,
          debug,
        );

        return {
          model: model.name,
          refine: false,
          output: JSON.stringify(json),
          debug: debugReport ?? undefined,
        } as JsonExtractResult;
      }
    } catch (err) {
      if (err instanceof InvalidJsonOutputError || err instanceof LLMBadRequestReceivedError) {
        this.logger.warn('UnprocessableEntityException thrown');
        throw new UnprocessableEntityException(err.message);
      }
      if (err instanceof LLMApiKeyMissingError || err instanceof LLMApiKeyInvalidError) {
        this.logger.warn('BadRequestException thrown');
        throw new BadRequestException(err.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
    }
  };


  @ApiOperation({
    summary: 'Return structured data from text as json using an example',
  })
  @ApiOkResponse({ description: 'The text was successfully organized as json.' })
  @ApiBody({ description: 'Request body with example input/output for extraction.' })
  @Post('example')
  @HttpCode(200)
  @RouteConfig({ schema: JsonExtractExampleRouteSchema })
  async extractExample(@Body() body: JsonExtractExampleDto) {
    const { exampleInput, exampleOutput, model, text, debug } = body;

    try {
      const { json, debugReport } = await this.jsonService.extractWithExample(
        text,
        model,
        { input: exampleInput, output: exampleOutput },
        debug,
      );

      return {
        model: model.name,
        refine: false,
        output: JSON.stringify(json),
        debug: debugReport ?? undefined,
      } as JsonExtractResult;

    } catch (err) {
      if (err instanceof InvalidJsonOutputError) {
        this.logger.warn('UnprocessableEntityException thrown due to invalid JSON');
        throw new UnprocessableEntityException(err.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
    }
  };


  @ApiOperation({ summary: 'Analyze a generated JSON output' })
  @ApiOkResponse({ description: 'Analysis successfully returned.' })
  @ApiBody({ description: 'Request body with JSON output and schema.' })
  @Post('analysis')
  @HttpCode(200)
  @RouteConfig({ schema: JsonAnalyzeRouteSchema })
  async analyzeJsonOutput(@Body() body: JsonAnalyzeRequest) {
    const { jsonOutput, jsonSchema, model, originalText, debug } = body;

    try {
      const { json: analysis, debugReport } = await this.jsonService.analyzeJsonOutput(
        model,
        jsonOutput,
        originalText,
        jsonSchema,
        debug,
      );

      return {
        model: model.name,
        analysis,
        debug: debugReport ?? undefined,
      } as JsonAnalyzeResult;

    } catch (err) {
      if (err instanceof InvalidJsonOutputError) {
        this.logger.warn('UnprocessableEntityException thrown due to invalid JSON');
        throw new UnprocessableEntityException(err.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
    }
  };

  

  @ApiOperation({ summary: 'Classify a text from a list of categories' })
  @ApiOkResponse({ description: 'Classification successfully returned.' })
  @ApiBody({ description: 'Text and categories to classify.' })
  @Post('classification')
  @RouteConfig({ schema: JsonClassificationRouteSchema })
  @HttpCode(200)
  async classifyText(@Body() body: JsonClassificationRequest) {
    const { text, categories, model, debug } = body;

    try {
      const { json: classification, debugReport } = await this.jsonService.classifyText(
        model,
        text,
        categories,
        debug,
      );

      return {
        model: model.name,
        classification,
        debug: debugReport ?? undefined,
      } as JsonClassificationResult;

    } catch (err) {
      if (err instanceof InvalidJsonOutputError) {
        this.logger.warn('UnprocessableEntityException thrown due to invalid JSON');
        throw new UnprocessableEntityException(err.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
    }
  };


  @ApiOperation({ summary: 'Return an output from a given prompt' })
  @ApiOkResponse({ description: 'Generic output successfully returned.' })
  @ApiBody({ description: 'Request body with prompt and model.' })
  @Post('generic-output')
  @RouteConfig({ schema: JsonGenericOutputRouteSchema })
  @HttpCode(200)
  async createGenericOutput(@Body() body: JsonGenericOutputRequest) {
    const { prompt, model, debug } = body;

    try {
      const { json, debugReport } = await this.jsonService.handleGenericPrompt(model, prompt, debug);

      return {
        model: model.name,
        output: json.output,
        debug: debugReport ?? undefined,
      } as JsonGenericOutputResult;

    } catch (err) {
      if (err instanceof InvalidJsonOutputError) {
        this.logger.warn('UnprocessableEntityException thrown due to invalid JSON');
        throw new UnprocessableEntityException(err.message);
      }
      this.logger.error('InternalServerErrorException thrown');
      throw new InternalServerErrorException(err.message);
    }
  };

}
