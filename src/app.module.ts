import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config"
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ParsersModule } from './parsers/parsers.module';
import configuration from './config/configuration';
import { OrganizedDataModule } from './organized-data/organized-data.module';
import { LoggerModule } from './logger/logger.module';


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
  TypeOrmModule.forRoot({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== "production",
    connectTimeoutMS: 10000
  }),
  AuthModule,
  ParsersModule,
  OrganizedDataModule,
  LoggerModule
],
})
export class AppModule {}
