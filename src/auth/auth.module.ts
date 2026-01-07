import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyAuthGuard } from './guard/apiKey-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './strategy/apiKey.strategy';


@Module({
  imports:[PassportModule],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyAuthGuard
    },
    ApiKeyStrategy,
  ],
  exports:[AuthService]
})
export class AuthModule {}
