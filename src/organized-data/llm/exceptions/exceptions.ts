export class LLMApiKeyMissingError extends Error {
  constructor(model: string) {
    super(`Missing API key for model: ${model}`);
  }
}

export class LLMApiKeyInvalidError extends Error {
  constructor(model: string) {
    super(`Invalid API key for model: ${model}`);
  }
}

export class LLMBadRequestReceivedError extends Error {
  constructor(model: string) {
    super(`Bad request sent to model: ${model}`);
  }
}

export class LLMNotAvailableError extends Error {
  constructor(model: string) {
    super(`Model not available: ${model}`);
  }
}

export class PromptTemplateFormatError extends Error {
  constructor() {
    super('Prompt template does not match input variables');
  }
}

export class RefineReservedChainValuesError extends Error {
  constructor(value: string) {
    super(`Reserved chain value ${value} cannot be used as an input variable.`);
  }
};

export class RefinePromptInputVaribalesError extends Error{
    constructor(promptTemplate: string, missingInputVariables: string){
         super(
            `${promptTemplate} is missing mandatory input variable: ${missingInputVariables}`
         )
    }
};