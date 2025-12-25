import { Global, Module } from '@nestjs/common';
import { ISOLogger } from './iso-logger.service';


@Global()
@Module({
  providers: [ISOLogger],
  exports: [ISOLogger],
})
export class LoggerModule {}