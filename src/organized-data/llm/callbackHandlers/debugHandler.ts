import { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { ChainCall,DebugReport,LlmChain } from "../schema/debug.schema"
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
   }

   
};