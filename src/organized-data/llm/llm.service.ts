import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

@Injectable()
export class LlmService {

    private geminiFlashLite: ChatGoogleGenerativeAI;
     
    constructor(private readonly configService: ConfigService) {
         this.geminiFlashLite=new ChatGoogleGenerativeAI({
        maxConcurrency: 5,
        maxRetries: 3,
        model: 'gemini-2.5-flash-lite',
        apiKey: this.configService.get<string>('geminiApiKey'),
        temperature: 0
    });
    }

   
    async generate(prompt: string): Promise<string> {
    const response = await this.geminiFlashLite.invoke(prompt);
     return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);
    }
    

}
  