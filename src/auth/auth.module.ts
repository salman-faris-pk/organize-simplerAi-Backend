import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyAuthGuard } from './guard/apiKey-auth.guard';

@Module({
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyAuthGuard
    },
    
  ],
  exports:[AuthService]
})
export class AuthModule {}
