import { Body, Controller, Post, Req } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';


@ApiSecurity('apiKey')
@ApiTags('json')
@Controller({path:'json' , version:'1'})
export class JsonController {

    constructor(private readonly llmService:LlmService){}

    
    @ApiBody({
  schema: {
    type: 'object',
    properties: {
      prompt: { type: 'string' },
    },
  },
    })
    @Post('text')
    async testTride(@Body('prompt') prompt: string){
       return await this.llmService.generate(prompt)
    }

}
