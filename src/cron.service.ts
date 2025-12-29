import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISOLogger } from './logger/iso-logger.service';

@Injectable()
export class CronService {
  constructor(
    private readonly httpService: HttpService,
    private logger: ISOLogger,
) {
    this.logger.setContext(CronService.name);
}

  @Cron('*/14 * * * *')
  async triggerHealthCheck() {
    try {
       const response=await firstValueFrom(
        this.httpService.get('http://localhost:3000/')
      );

      this.logger.debug(`Health check successful: ${response.status}`)
   
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
  }
}