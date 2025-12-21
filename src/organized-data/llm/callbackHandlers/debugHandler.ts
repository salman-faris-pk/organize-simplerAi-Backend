import { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { ChainCall,DebugReport,LlmCall } from "../schema/debug.schema"
import type { ChainValues } from "@langchain/core/utils/types"
import type { LLMResult } from "@langchain/core/outputs"
import { Serialized } from "@langchain/core/load/serializable"



export class DebugCallbcakHandler extends BaseCallbackHandler {
    name = "DebugCallbackHandler"


   private _debugReport: DebugReport;
   private _chainCallCount = 0;
   private _llmCallCount = 0;

   constructor() {
    super();
    this._debugReport = {
      chainCallCount: 0,
      llmCallCount: 0,
      chains: [],
      llms: [],
    };
  }

   get debugReport(){
    return this._debugReport;
   };



   async handleChainStart(chain:Serialized,inputs: ChainValues,runId: string):Promise<void>{
       
    const startedChain: ChainCall={
        chainName: Array.isArray(chain.id) && chain.id.length > 0 ? chain.id[chain.id.length - 1] : "unknown-chain",
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

      this._chainCallCount++;
      this._debugReport.chainCallCount = this._chainCallCount;
      this._debugReport.chains.push(startedChain);
   };


   async handleChainEnd(outputs:ChainValues,runId: string):Promise<void>{
        const endedChain= this._debugReport?.chains.find(
            (chain) => chain.runId === runId
        );
        if(endedChain){
          endedChain.end.outputs = outputs;   
        };
   };

   async handleChainError(err: unknown, runId: string):Promise<void> {
        const erroredchain= this._debugReport?.chains.find(
            (chain) => chain.runId === runId
        );
        if(erroredchain){
          erroredchain.error.err = err;
        };
   };



   async handleLLMStart(
    llm: Serialized, 
    prompts: string[], 
    runId: string, 
    parentRunId?: string
  ):Promise<void> {
        
    const startedLlmCall: LlmCall ={
         llmName: Array.isArray(llm.id) && llm.id.length > 0 ? llm.id[llm.id.length - 1] : "unknown-llm",
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

        this._llmCallCount++;
        this._debugReport.llmCallCount = this._llmCallCount;
        this._debugReport.llms.push(startedLlmCall);
   };


   async handleLLMEnd(output: LLMResult, runId: string):Promise<void> {        
       const endedLlmCall = this.debugReport.llms.find(
         (llmCall) => llmCall.runId === runId,
       );

       if (endedLlmCall) {
        endedLlmCall.end.outputs = output; 
       }
   };


   async handleLLMError(err: unknown, runId: string):Promise<void> {
       const erroredLLmCall= this._debugReport.llms.find(
        (llmcall) => llmcall.runId === runId
       );

       if(erroredLLmCall){
        erroredLLmCall.error.err = err; 
       };
   }
   
};