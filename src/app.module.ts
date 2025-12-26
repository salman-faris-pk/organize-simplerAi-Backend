import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config"
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { ParsersModule } from './parsers/parsers.module';
import configuration from './config/configuration';
import { OrganizedDataModule } from './organized-data/organized-data.module';
import { LoggerModule } from './logger/logger.module';
import { DrizzleModule } from './database/drizzle.module';


@Module({
  imports: [ConfigModule.forRoot({ 
    isGlobal: true,
    load:[configuration],
    cache: true
  }),
  ThrottlerModule.forRoot([
     {
      ttl: 30,  //seconds
      limit: 200  //requests
     }
  ]),
  AuthModule,
  ParsersModule,
  OrganizedDataModule,
  LoggerModule,
  DrizzleModule
],
})
export class AppModule {}
