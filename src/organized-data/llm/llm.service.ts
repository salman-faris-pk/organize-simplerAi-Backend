import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { Model } from './types/types';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { LLMApiKeyInvalidError, LLMApiKeyMissingError, LLMBadRequestReceivedError, LLMNotAvailableError, PromptTemplateFormateError, RefinePromptInputVaribalesError } from './exceptions/exceptions';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from '@langchain/core/prompts';
import { ChainValues } from '@langchain/core/utils/types';
import { DebugCallbcakHandler } from './callbackHandlers/debugHandler';
import { Runnable } from '@langchain/core/runnables';


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
}        


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
  