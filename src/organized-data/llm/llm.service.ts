import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { Model } from './types/types';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { LLMApiKeyInvalidError, LLMApiKeyMissingError, LLMBadRequestReceivedError, LLMNotAvailableError, PromptTemplateFormateError, RefinePromptInputVaribalesError, RefineReservedChainValuesError } from './exceptions/exceptions';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from '@langchain/core/prompts';
import { ChainValues } from '@langchain/core/utils/types';
import { DebugCallbcakHandler } from './callbackHandlers/debugHandler';
import { Runnable } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';
import { RefineCallbackHandler } from './callbackHandlers/refineHandler';


@Injectable()
export class LlmService {


async generateOutput(
    model: Model,
    promptTemplate: PromptTemplate,
    chainValues: ChainValues,
    debug: boolean
){
  const llm= this.retrieveAvailableModel(model);

  try {
      await promptTemplate.format(chainValues) // like context..
   } catch (err) {
      throw new PromptTemplateFormateError()
  }

      const llmchain: Runnable<ChainValues, any> = promptTemplate.pipe(llm);

    try {

        const handler=new DebugCallbcakHandler();
        const output= await llmchain.invoke(chainValues, { callbacks: debug ? [handler] : [] });

        return {
          output,
          debugReport: debug ? handler.debugReport : null
        };
        
    } catch (err) {
        if(err?.response?.status === 401){
           throw new LLMApiKeyInvalidError(model.name);
        }
        if(err?.response?.status === 400){
            throw new LLMBadRequestReceivedError(model.name);
        }
        throw err;
    }          
};        


async splitDocument(
      document: string,
      params: { chunkSize: number; overlap: number}  
 ){
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: params?.chunkSize,
        chunkOverlap: params?.overlap
      });
      
      const output= await splitter.createDocuments([document])

      return output;
 };



 async generateRefineOutput(
    model: Model,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues & { input_documents: Document[]},
    debug: boolean = false
 ) {

    const llm= this.retrieveAvailableModel(model);

    if(chainValues['context'] || chainValues['existing_answer']){
       throw new RefineReservedChainValuesError('context or existing_answer')
    };

    this.throwErrorIfInputVariableMissing(
        'initialPromptTemplate',
        'context',
        initialPromptTemplate.inputVariables
    );

    this.throwErrorIfInputVariableMissing(
        'refinePromptTemplate',
        'context',
        refinePromptTemplate.inputVariables
    );

    this.throwErrorIfInputVariableMissing(
        'refinePromptTemplate',
        'existing_answer',
        refinePromptTemplate.inputVariables
    );

    const documents = chainValues.input_documents;
   
    const debugHandler = new DebugCallbcakHandler();
    const refineHandler = new RefineCallbackHandler();
    const callbacks= debug ? [refineHandler, debugHandler] : [refineHandler];

    if (documents.length === 0) {
        return {
            output: '',
            llmCallCount: refineHandler.llmCallCount,
            debugReport: debug ? debugHandler.debugReport : null,
        };
    };

    try {

    let answer: string | undefined;

        for(const doc of documents){
            if(!answer){    //it check answer is undefine or empty in first iteration then ...
                const chain= initialPromptTemplate.pipe(llm);

                answer= await chain.invoke(
                    { context: doc.pageContent },
                    { callbacks }
                );
            }else{    // this works only if there is answer is there and refine ..
               const  refineChain = refinePromptTemplate.pipe(llm);

               answer = await refineChain.invoke(
                 {
                   context: doc.pageContent,
                   existing_answer: answer,
                 },
                 { callbacks },
               );
            }
        };

        return {
            output: answer || '',
            llmCallCount: refineHandler.llmCallCount,
            debugReport: debug ? debugHandler.debugReport : null,
        }
        
    } catch (err) {
        if (err?.response?.status === 401) {
          throw new LLMApiKeyInvalidError(model.name);
        };

        if (err?.response?.status === 400) {
        throw new LLMBadRequestReceivedError(model.name);
        };

        throw err;
    }
 };

 

 private throwErrorIfInputVariableMissing(
   templateName: string,
   variableName: string,
   inputVariable: string[]  
  ){
      if(!inputVariable.includes(variableName)){
           throw new RefinePromptInputVaribalesError(templateName, variableName)
      };
 };       
   


 private retrieveAvailableModel(model: Model): BaseLanguageModel {
     switch(model.name) {
        case 'gemini-2.0-flash-lite':
        case 'gemini-2.5-flash':    
        case 'gemini-2.5-flash-lite': {
            if(!model.apiKey){
                 throw new LLMApiKeyMissingError(model.name)
            };

            const llm = new ChatGoogleGenerativeAI({
               cache: true,
               maxConcurrency: 10,
               maxRetries: 3,
               model: model.name,
               apiKey: model.apiKey,
               temperature: 0
            });

            return llm;
        }
        default:{
                throw new LLMNotAvailableError(model.name)
        }
     }
 } 

};
  