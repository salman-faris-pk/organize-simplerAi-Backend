import { Module } from '@nestjs/common';
import { JsonService } from './json/json.service';
import { JsonController } from './json/json.controller';
import { LlmService } from './llm/llm.service';

@Module({
  providers: [JsonService, LlmService,],
  controllers: [JsonController]
})
export class OrganizedDataModule {}
