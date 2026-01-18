import { Injectable } from '@nestjs/common';
import { Model } from './types/types';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMBadRequestReceivedError,
  RefineReservedChainValuesError,
  LLMNotAvailableError,
  PromptTemplateFormatError,
  RefinePromptInputVaribalesError,
} from './exceptions/exceptions';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PromptTemplate } from '@langchain/core/prompts';
import { DebugCallbackHandler } from './callbackHandlers/debugHandler';
import { RunnableSequence } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';
import { RefineCallbackHandler } from './callbackHandlers/refineHandler';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';


@Injectable()
export class LlmService {

  async generateOutput(
    model: Model,
    prompt: PromptTemplate,
    input: Record<string, any>,
    debug: boolean,
  ) {
    const llm = this.createLLM(model);

    try {
      await prompt.format(input);
    } catch {
      throw new PromptTemplateFormatError();
    }

    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const debugHandler = debug ? new DebugCallbackHandler() : null;

    try {
      const output = await chain.invoke(input, {
        callbacks: debugHandler ? [debugHandler] : [],
      });

      return {
        output,
        debugReport: debug ? debugHandler?.debugReport : null,
      };
    } catch (err) {
      if (err?.response?.status === 401) {
        throw new LLMApiKeyInvalidError(model.name);
      }
      if (err?.response?.status === 400) {
        throw new LLMBadRequestReceivedError(model.name);
      }
      throw err;
    }
  }

  async splitDocument(
    text: string,
    params: { chunkSize: number; overlap: number },
  ): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: params.chunkSize,
      chunkOverlap: params.overlap,
    });

    return splitter.createDocuments([text]);
  };


  async generateRefineOutput(
    model: Model,
    initialPrompt: PromptTemplate,
    refinePrompt: PromptTemplate,
    input: {
      input_documents: Document[];
      [key: string]: any;
    },
    debug:boolean=false,
  ) {
    const llm = this.createLLM(model);

    try {
      if ('context' in input || 'existing_answer' in input) {
        throw new RefineReservedChainValuesError('context or existing_answer');
      }

      try {
        await initialPrompt.format({ context: '' });
      } catch {
        throw new RefinePromptInputVaribalesError('initialPrompt', 'context');
      }

      try {
        await refinePrompt.format({
          context: '',
          existing_answer: '',
        });
      } catch {
        throw new RefinePromptInputVaribalesError(
          'refinePrompt',
          'context or existing_answer',
        );
      }

      const outputParser = new StringOutputParser();

      const initialChain = RunnableSequence.from([
        initialPrompt,
        llm,
        outputParser,
      ]);

      const refineChain = RunnableSequence.from([
        refinePrompt,
        llm,
        outputParser,
      ]);

      const refineHandler = new RefineCallbackHandler();
      const callbacks: BaseCallbackHandler[] = [refineHandler];

      let debugHandler: DebugCallbackHandler | undefined;

      if (debug) {
        debugHandler = new DebugCallbackHandler();
        callbacks.push(debugHandler);
      }

      const documents = input.input_documents ?? [];

      if (documents.length === 0) {
        return {
          output: '',
          llmCallCount: refineHandler.llmCallCount,
          debugReport: debugHandler?.debugReport ?? null,
        };
      }

      let existingAnswer = '';

      for (const doc of documents) {
        const chain = existingAnswer ? refineChain : initialChain;

        existingAnswer = await chain.invoke(
          {
            ...input,
            context: doc.pageContent,
            existing_answer: existingAnswer,
          },
          { callbacks },
        );
      }

      return {
        output: existingAnswer,
        llmCallCount: refineHandler.llmCallCount,
        debugReport: debugHandler?.debugReport ?? null,
      };
    } catch (err) {
      if (err?.response?.status === 401) {
        throw new LLMApiKeyInvalidError(model.name);
      }
      if (err?.response?.status === 400) {
        throw new LLMBadRequestReceivedError(model.name);
      }
      throw err;
    }
  };


  private createLLM(model: Model): ChatOpenAI {
    if (!model.apiKey) {
      throw new LLMApiKeyMissingError(model.name);
    }

    switch (model.name) {
      case 'gpt-5-mini':
      case 'gpt-4.1-nano':
        return new ChatOpenAI({
          model: model.name,
          apiKey: model.apiKey,
          temperature: 0,
          maxRetries: 3,
        });
      default:
        throw new LLMNotAvailableError(model.name);
    }
  }
}
