import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fs from 'fs';
import path from 'path';

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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Retry-Attempt'],
    credentials: true,
  });
  app.set('trust proxy', 1);
  app.enableShutdownHooks();

  const customCss = fs.readFileSync(
    path.resolve(__dirname, '../node_modules/swagger-ui-dist/swagger-ui.css'),
    'utf-8',
  );

  // const customJs1 = fs.readFileSync(
  //   path.resolve(
  //     __dirname,
  //     '../node_modules/swagger-ui-dist/swagger-ui-bundle.js',
  //   ),
  //   'utf-8',
  // );
  //
  // const customJs2 = fs.readFileSync(
  //   path.resolve(
  //     __dirname,
  //     '../node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
  //   ),
  //   'utf-8',
  // );

  const configSwagger = new DocumentBuilder()
    .setTitle('Contacts Apps API')
    .setDescription('Contacts Apps API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const generateSwaggerDocument = () =>
    SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api/v1/docs', app, generateSwaggerDocument, {
    customCss: customCss,
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
