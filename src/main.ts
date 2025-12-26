import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
 NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart"
import compress from "@fastify/compress"
import { ISOLogger } from './logger/iso-logger.service';
import { registerFastifyLogger } from './logger/fastify-logger.hook';
import './typebox-formats'
import { ConfigService } from "@nestjs/config"

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10 * 1024 * 1024,
      ajv: {
        customOptions:{
          coerceTypes: true,
          removeAdditional: 'all',
          useDefaults: true,
          allErrors: true
        },
        plugins: [
          require('ajv-formats')
        ]
      },
    }),
    {
      bufferLogs: true,
    }
  );
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('nodeEnv');
  
  if (nodeEnv !== 'production') {
    const fastify = app.getHttpAdapter().getInstance();
    const logger = await app.resolve(ISOLogger);
    registerFastifyLogger(fastify, logger);
  }

  app.enableCors();


  await app.register(helmet, {
    contentSecurityPolicy: false
  });

   app.enableVersioning({
         type: VersioningType.URI
   });

   await app.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      }
   });

   await app.register(compress, {
     encodings: ['gzip', 'deflate', 'br'],
   });


    if (nodeEnv !== 'production') {
      const config= new DocumentBuilder()
       .setTitle('Organize Simpler APi')
       .setContact(
         'salmanul faris pk',
         'https://github.com/salman-faris-pk',
         'salmanulfarispk2001@gmail.com'
       )
       .setDescription(
        'Organize Simple is an API designed to make your data easy to organize and understand through large language model intelligence.'
       )
       .setVersion('1.0')
       .addApiKey(
        {
          type: "apiKey",
          name: 'X-API-KEY',
          in: 'header',
          description: 'API key for authentication of registered applications'
        },
        'apiKey'
       )
       .addTag('organize-simpler')
       .build();

       const document= SwaggerModule.createDocument(app, config);
       SwaggerModule.setup('api-docs', app, document);
      };

             
     await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


