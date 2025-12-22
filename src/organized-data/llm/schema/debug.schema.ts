import { Type,Static } from "@sinclair/typebox"


 const ChainCallSchema= Type.Object({
    chainName: Type.String({ description: 'name of the chain'}),
    runId: Type.String({ description: 'runId of the chain'}),

    start: Type.Object({
        inputs: Type.Any({ description: 'inputs of the chain'})
    }),

    end: Type.Object({
        outputs: Type.Any({ description: 'outputs of the chain'})
    }),

    error: Type.Object({
        err: Type.Any({ description:'error of the chain'})
    })
});

export type ChainCall = Static<typeof ChainCallSchema>;


const LlmCallSchema = Type.Object({
  llmName: Type.String({ description: 'name of the llm' }),

  parentRunId: Type.Optional(
    Type.String({ description: 'runId of the parent chain' }),
  ),

  runId: Type.String({ description: 'runId of the llm' }),

  start: Type.Object({
    prompts: Type.Any({ description: 'prompts used for the call' }),
  }),

  end: Type.Object({
    outputs: Type.Any({ description: 'output of the call' }),
  }),

  error: Type.Object({
    err: Type.Any({ description: 'error of the llm chain'}),
  }),
});

export type LlmCall =Static<typeof LlmCallSchema>




export const DebugRepostSchema= Type.Object({
    chainCallCount: Type.Number({
        description: 'number of chain created'
    }),

    llmCallCount: Type.Number({
        description: 'number of calls to the model'
    }),

    chains: Type.Array(ChainCallSchema),
    llms: Type.Array(LlmCallSchema)

})

export type DebugReport =Static<typeof DebugRepostSchema>;