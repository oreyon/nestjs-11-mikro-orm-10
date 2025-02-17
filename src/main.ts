import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api/v1');
  const logger: LoggerService = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.use(
    cookieParser([
      `${process.env.JWT_ACCESS_TOKEN_SECRET}`,
      `${process.env.JWT_REFRESH_TOKEN_SECRET}`,
    ]),
  );
  app.useLogger(logger);
  app.enableCors({
    origin: [`${process.env.IP_FRONTEND_ORIGIN}`],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.set('trust proxy', 1);
  app.enableShutdownHooks();

  const configSwagger = new DocumentBuilder()
    .setTitle('Contacts Apps API')
    .setDescription('Contacts Apps API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const generateSwaggerDocument = () =>
    SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api/v1/docs', app, generateSwaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
