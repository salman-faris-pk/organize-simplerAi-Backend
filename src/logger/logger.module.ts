import { Global, Module } from '@nestjs/common';
import { ISOLogger } from './iso-logger.service';


@Global()  // cause of global we dont import module or providers explicitly,we can call directly to other services file
@Module({
  providers: [ISOLogger],
  exports: [ISOLogger],
})
export class LoggerModule {}