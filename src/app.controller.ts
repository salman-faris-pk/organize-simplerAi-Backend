import { Controller, Get } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { Public } from './auth/decorator/public.decorator';


@ApiSecurity('apiKey')
@Public()
@Controller()
export class AppController {
  @Get()
  getHealth() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
