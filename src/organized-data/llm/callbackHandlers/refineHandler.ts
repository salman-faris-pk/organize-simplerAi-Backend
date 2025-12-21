import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { Serialized } from "@langchain/core/load/serializable";

export class RefineCallbackHandler extends BaseCallbackHandler {
  name = "RefineCallbackHandler";
  private _llmCallCount = 0;

  get llmCallCount() {
    return this._llmCallCount;
  }

  async handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string
  ): Promise<void> {
    this._llmCallCount++;
  }
}


//Both handlers contain llmCallcount,so
// DebugCallbackHandler: Tracks detailed chain & LLM execution for developer debugging and observability. 
// RefineCallbackHandler: Lightweight handler that counts LLM calls for control/refinement purposes.here control or purpose means we can stop chain or modify inputs when we set a target count etc..
// Both handlers increment on handleLLMStart and will produce the same LLM call count at the end.

