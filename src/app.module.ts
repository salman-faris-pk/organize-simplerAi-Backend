import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config"
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ParsersModule } from './parsers/parsers.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
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
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
