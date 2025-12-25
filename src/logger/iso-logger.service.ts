import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class ISOLogger extends ConsoleLogger {
  constructor(private readonly configService: ConfigService) {
    super('default', { timestamp: true });

    if (this.configService.get('NODE_ENV') !== 'production') {
      this.setLogLevels(['log', 'warn', 'error', 'debug']);
    } else {
      this.setLogLevels(['error', 'warn']);
    }
  }

  protected getTimestamp(): string {
    return new Date().toISOString();
  }
}
