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
        const { debugReport, json, refineRecap } =
          await this.jsonService.extractWithSchemaAndRefine(
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
  }
}
