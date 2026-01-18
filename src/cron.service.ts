import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISOLogger } from './logger/iso-logger.service';
import { ConfigService } from "@nestjs/config"



@Injectable()
export class CronService {
   
  private readonly url: string

  constructor(
    private readonly httpService: HttpService,
    private logger: ISOLogger,
    private configService: ConfigService,
) {
    this.logger.setContext(CronService.name)
     const nodeEnv = this.configService.get<string>('NODE_ENV')
     this.url =
      nodeEnv === 'production'
        ? this.configService.get<string>('HEALTH_CHECK_URL')!
        : 'http://localhost:3000/';
}


  @Cron('*/14 * * * *')
  async triggerHealthCheck() {
    try {
       const response=await firstValueFrom(
        this.httpService.get(this.url)
      );

      this.logger.debug(`Health check successful: ${response.status}`)
   
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
  }
}