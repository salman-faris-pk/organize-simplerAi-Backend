import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyAuthGuard } from './guard/apiKey-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './strategy/apiKey.strategy';
// import { DrizzleService } from '../database/drizzle.service';


@Module({
  imports:[PassportModule],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyAuthGuard
    },
    ApiKeyStrategy,
    // DrizzleService  doent need cause already globalised
  ],
  exports:[AuthService]
})
export class AuthModule {}
