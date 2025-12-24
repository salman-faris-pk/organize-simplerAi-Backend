import { Injectable } from '@nestjs/common';
import { RefineParams } from './types/types';
import { LlmService } from '../llm/llm.service';
import { Model } from '../llm/types/types';
import { jsonZeroShotSchemaExtraction } from './prompts';
import { InvalidJsonOutputError } from './exceptions/exception';


@Injectable()
export class JsonService {

    private defaultRefineParams: RefineParams ={
        chunkSize: 2000,
        overlap: 100
    };
    
    constructor( private llmService: LlmService){}




    async extractWithSchema(
        text: string,
        model: Model,
        schema: string,
        debug: false,
    ){
        
        const { output,debugReport}= await this.llmService.generateOutput(
            model,
            jsonZeroShotSchemaExtraction,
            {
                context: text,
                jsonSchema: schema
            },
            debug
        );

         try {

            const json: object =JSON.parse(output.text);

            return {
                json,
                debugReport
            };
            
         } catch (err) {
            throw new InvalidJsonOutputError()
         }
    };


    
    




};
