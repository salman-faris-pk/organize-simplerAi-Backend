import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
 NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import helmet from "@fastify/helmet";


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10 * 1024 * 1024,
      ajv: {
        customOptions:{
          coerceTypes: true,
          removeAdditional: 'all'
        }
      }
    }),
    {
      bufferLogs: true,
    }
  );

  app.enableCors();

  await app.register(helmet, {
    contentSecurityPolicy: false
  });

   app.enableVersioning({
         type: VersioningType.URI
   });


    if (process.env.NODE_ENV !== 'production') {
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


