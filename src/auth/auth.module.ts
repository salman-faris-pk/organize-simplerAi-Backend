import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyAuthGuard } from './guard/apiKey-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './strategy/apiKey.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '../database/entities/api-key.entity';
import { Application } from '../database/entities/application.entity';

@Module({
  imports:[PassportModule,TypeOrmModule.forFeature([ApiKey, Application])],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyAuthGuard
    },
    ApiKeyStrategy
  ],
  exports:[AuthService]
})
export class AuthModule {}
