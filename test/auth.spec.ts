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
import * as jest from 'jest';
import {
  CurrentUserResponse,
  EmailVerificationResponse,
  LoginResponse,
} from '../src/auth/dto/auth.dto';

describe('AuthController', () => {
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

  describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: '',
          password: '',
          username: '',
        });

      const body = response.body as ErrorResponseBody;

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be able to register a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'example@example.com',
          password: 'example',
          username: 'example',
        });

      logger.info(response.body);
      expect(response.status).toBe(201);
    });

    it('should be rejected if username is already taken', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'example@example.com',
          password: 'example',
          username: 'example',
        });

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
      await testService.createUser();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: '',
          emailVerificationToken: '',
        });

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: 'example@example.com',
          emailVerificationToken: '',
        });

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: '',
          emailVerificationToken: 'secret',
        });

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be able to verify email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({
          email: 'example@example.com',
          emailVerificationToken: 'secret',
        });

      const body = response.body as WebResponse<EmailVerificationResponse>;

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.email).toBe('example@example.com');
      expect(body.data.role).toBe('ADMIN');
      expect(body.data.isVerified).toBe(true);
      expect(body.data.verifiedTime).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: '',
          password: '',
        });

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be rejected if email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: '',
          password: 'example',
        });

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be rejected if password is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'exmaple',
          password: '',
        });

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'example@example.com',
          password: 'example',
        });

      const body = response.body as WebResponse<LoginResponse>;

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.email).toBe('example@example.com');
      expect(body.data.username).toBe('example');
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/current', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    it('should be rejected if access token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/current')
        .set('Cookie', [`accesstoken=wrongtoken`]);

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(body.errors).toBeDefined();
    });

    it('should be able to get current user', async () => {
      const tokens = await testService.login(app);
      console.log(tokens.signedAccessToken);
      console.log(tokens.signedRefreshToken);

      // Pass signed token to cookie
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/current')
        // .set('Authorization', `Bearer ${tokens.accessToken}`);
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      console.log('Response:', response);
      const body = response.body as WebResponse<CurrentUserResponse>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.email).toBe('example@example.com');
      expect(body.data.username).toBe('example');
      expect(body.data.role).toBeDefined();
    });
  });

  describe('DELETE /api/v1/auth/logout', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    it('should be rejected if access token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/auth/logout')
        .set('Cookie', [`accesstoken=wrongtoken`]);

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(body.errors).toBeDefined();
    });

    it('should be able to logout', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/auth/logout')
        .set('Cookie', [`${tokens.signedAccessToken}`]);
      // .set('Authorization', `Bearer ${tokens.accessToken}`);

      const body = response.body as WebResponse<boolean>;
      logger.info(response.body);
      expect(response.status).toBe(204);
      expect(body.data).toBeUndefined();
    });
  });
});
