import { Injectable } from '@nestjs/common';
import { RefineParams } from './types/types';
import { LlmService } from '../llm/llm.service';
import { Model } from '../llm/types/types';
import {
  jsonAnalysis,
  jsonClassification,
  jsonOneShotExtraction,
  jsonZeroShotSchemaExtraction,
  jsonZeroShotSchemaExtractionRefine,
} from './prompts';
import { InvalidJsonOutputError } from './exceptions/exception';
import { Analysis } from './schema/jsonAnalyzeResult.Schema';
import { Classification } from './schema/jsonClassificationResult.schema';
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class JsonService {
  private defaultRefineParams: RefineParams = {
    chunkSize: 2000,
    overlap: 100,
  };

  constructor(private llmService: LlmService) {}


  /** Simple schema extraction */
  async extractWithSchema(
    text: string,
    model: Model,
    schema: string,
    debug = false,
  ) {
    const { output, debugReport } = await this.llmService.generateOutput(
      model,
      jsonZeroShotSchemaExtraction,
      {
        context: text,
        jsonSchema: schema,
      },
      debug,
    );

    try {
      const json: object = JSON.parse(output);

      return {
        json,
        debugReport,
      };
    } catch {
      throw new InvalidJsonOutputError();
    }
  };


  /** Schema extraction with refinement */
  async extractWithSchemaAndRefine(
    text: string,
    model: Model,
    schema: string,
    refineParams?: RefineParams,
    debug = false,
  ) {
    const params = refineParams || this.defaultRefineParams;
    const documents = await this.llmService.splitDocument(text, params);

    const { output, llmCallCount, debugReport } = await this.llmService.generateRefineOutput(
        model,
        jsonZeroShotSchemaExtraction,
        jsonZeroShotSchemaExtractionRefine,
        {
          input_documents: documents,
          jsonSchema: schema,
        },
        debug,
      );

    try {
      const json: object = JSON.parse(output);
      return {
        json,
        refineRecap: { ...params, llmCallCount },
        debugReport,
      };
    } catch {
      throw new InvalidJsonOutputError();
    }
  };


  /** One-shot extraction with example */
  async extractWithExample(
    text: string,
    model: Model,
    example: { input: string; output: string },
    debug = false,
  ) {
    const { output, debugReport } = await this.llmService.generateOutput(
      model,
      jsonOneShotExtraction,
      {
        context: text,
        exampleInput: example.input,
        exampleOutput: example.output,
      },
      debug,
    );

    try {
      const json: object = JSON.parse(output);

      return {
        json,
        debugReport,
      };
    } catch {
      throw new InvalidJsonOutputError();
    }
  };


  /** Analyze generated JSON against schema */
  async analyzeJsonOutput(
    model: Model,
    jsonOutput: string,
    originalText: string,
    jsonSchema: string,
    debug = false,
  ) {
    const outputFormat: Analysis = {
      corrections: [
        {
          field: 'the field in the generated JSON that needs to be corrected',
          issue: 'the issue you identified',
          description:
            'your description of the issue, give your full reasoning for why it is an issue',
          suggestion: 'your suggestion for correction',
        },
      ],
      textAnalysis:
        'Your detailed and precise analysis, exposing your whole thought process, step by step. Do not provide a corrected JSON output in this field. Generate a readable text in markdown.',
    };

    const { output, debugReport } = await this.llmService.generateOutput(
      model,
      jsonAnalysis,
      {
        jsonSchema,
        originalText,
        jsonOutput,
        outputFormat: JSON.stringify(outputFormat),
      },
      debug,
    );

    try {
      const json: Analysis = JSON.parse(output);
      if (
        Array.isArray(json.corrections) &&
        json.corrections.every(
          (c) =>
            typeof c.field === 'string' &&
            typeof c.issue === 'string' &&
            typeof c.description === 'string' &&
            typeof c.suggestion === 'string',
        )
      ) {
        return { json, debugReport };
      } else {
        throw new InvalidJsonOutputError();
      }
    } catch {
      throw new InvalidJsonOutputError();
    }
  };


  /** Text classification */
  async classifyText(
    model: Model,
    text: string,
    categories: string[],
    debug = false,
  ) {
    const outputFormat = {
      classification: 'classification of the text',
      confidence:
        'number representing your confidence of the classification in percentage. display only the number, not the percentage sign',
    };

    const { output, debugReport } = await this.llmService.generateOutput(
      model,
      jsonClassification,
      {
        categories,
        text,
        outputFormat: JSON.stringify(outputFormat),
      },
      debug,
    );

    try {
      const json: Classification = JSON.parse(output);

      if (json.classification && json.confidence) {
        return {
          json,
          debugReport,
        };
      } else {
        throw new InvalidJsonOutputError();
      }
    } catch {
      throw new InvalidJsonOutputError();
    }
  };


  /** Generic prompt handler */
  async handleGenericPrompt(model: Model, prompt: string, debug = false) {
    const { output, debugReport } = await this.llmService.generateOutput(
      model,
      new PromptTemplate({
        inputVariables: ['prompt'],
        template: '{prompt}',
      }),
      {
        prompt,
      },
      debug,
    );

    return { json: { output }, debugReport };
  };
  
}
