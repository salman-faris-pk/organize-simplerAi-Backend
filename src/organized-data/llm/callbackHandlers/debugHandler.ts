import { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { ChainCall,DebugReport,LlmCall } from "../schema/debug.schema"
import type { ChainValues } from "@langchain/core/utils/types"
import type { LLMResult } from "@langchain/core/outputs"
import { Serialized } from "@langchain/core/load/serializable"



export class DebugCallbcakHandler extends BaseCallbackHandler {
    name: 'DebugCallbcakHandler';


   private _debugReport: DebugReport;
   private _chainCallCount = 0;
   private _llmCallCount = 0;

   get debugReport(){
    return this._debugReport;
   };



   async handleChainStart(chain:Serialized,inputs: ChainValues,runId: string):Promise<void>{
       
    const startedChain: ChainCall={
        chainName: chain.id.at(-1) ?? 'unknown-chain',
        runId,
        start:{
            inputs,
        },
        end:{
            outputs:null
        },
        error:{
            err: null
        },
    };

     this._debugReport ={
        chainCallCount: ++this._chainCallCount,
        llmCallCount : this._llmCallCount,
        chains: [...(this._debugReport?.chains ?? []), startedChain],  //Take all previous chains (if exist otherwise empty array ) and append or add the new one
        llms: [...(this._debugReport.llms ?? [])]
     }

   };


   async handleChainEnd(outputs:ChainValues,runId: string):Promise<void>{
         const endedChain= this._debugReport?.chains.find(
            (chain) => chain.runId === runId
        );

        if(!endedChain){
            return;
        };

        endedChain.end.outputs = outputs;

   };

   async handleChainError(err: any, runId: string):Promise<void> {
        const erroredchain= this._debugReport?.chains.find(
            (chain) => chain.runId === runId
        );

        if(!erroredchain){
            return;
        };

        erroredchain.error.err = err;
   };



   async handleLLMStart(llm: Serialized, prompts: string[], runId: string, parentRunId?: string):Promise<void> {
        
    const startedLlmCall: LlmCall ={

         llmName: llm.id.at(-1) ?? " unknown-llm",
         parentRunId,
         runId,
         start: {
            prompts,
         },
         end:{
            outputs: null,
         },
         error:{
            err:null
         },
    };

       this._debugReport={
          chainCallCount: this._chainCallCount,
          llmCallCount: ++this._llmCallCount,
          chains: [...(this._debugReport?.chains ?? [])],
          llms: [...(this._debugReport?.llms ?? []), startedLlmCall]
       };

   };


   async handleLLMEnd(output: LLMResult, runId: string):Promise<void> {
         
       const endedLlmCall = this.debugReport.llms.find(
         (llmCall) => llmCall.runId === runId,
       );

       if (!endedLlmCall) {
         return;
       }

       endedLlmCall.end.outputs = output;
   };


   async handleLLMError(err: any, runId: string):Promise<void> {
       const erroredLLmCall= this._debugReport.llms.find(
        (llmcall) => llmcall.runId === runId
       );

       if(!erroredLLmCall){
        return;
       };

       erroredLLmCall.error.err = err;
   }
   
};