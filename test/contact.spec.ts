import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
const configService = new ConfigService();
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
// import * as jest from 'jest';

describe('ContactController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  type WebResponse<T> = {
    message: string;
    data: T;
    errors: string | Array<{ validation: string; message: string }>;
    paging: Paging;
  };

  type Paging = {
    size: number;
    totalPage: number;
    currentPage: number;
  };

  type ErrorResponseBody = {
    errors: string | Array<{ validation: string; message: string }>;
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);

    app.setGlobalPrefix('api/v1');
    app.use(
      cookieParser([
        String(configService.get('JWT_ACCESS_TOKEN_SECRET')),
        String(configService.get('JWT_REFRESH_TOKEN_SECRET')),
      ]),
    );

    app.enableShutdownHooks();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/contacts', () => {
    beforeEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
    });

    it('should be reject if request is invalid', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({
          firstName: '',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    // it('should be able to register a user', async () => {
    //   const response = await request(app.getHttpServer())
    //     .post('/api/v1/auth/register')
    //     .send({
    //       email: 'example@example.com',
    //       password: 'example',
    //       username: 'example',
    //     });
    //
    //   logger.info(response.body);
    //   expect(response.status).toBe(201);
    // });
    //
    // it('should be rejected if username is already taken', async () => {
    //   await testService.createUser();
    //   const response = await request(app.getHttpServer())
    //     .post('/api/v1/auth/register')
    //     .send({
    //       email: 'example@example.com',
    //       password: 'example',
    //       username: 'example',
    //     });
    //
    //   const body = response.body as ErrorResponseBody;
    //   logger.info(response.body);
    //   expect(response.status).toBe(400);
    //   expect(body.errors).toBeDefined();
    // });
  });
});
