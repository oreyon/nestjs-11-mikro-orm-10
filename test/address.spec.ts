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
import { Contact } from '../src/contact/entities/contact.entity';
import {
  CreateAddressRes,
  GetAddressRes,
} from '../src/address/dto/address.dto';
// import * as jest from 'jest';

const startTest = async (testService: TestService) => {
  await testService.deleteAllAddress();
  await testService.deleteAllContact();
  await testService.deleteAllUser();

  await testService.createUser();
  await testService.verifyEmail();
  await testService.createContact();
  await testService.createManyContacts();
  await testService.createManyAddress();
};

const endTest = async (testService: TestService) => {
  await testService.deleteAllAddress();
  await testService.deleteAllContact();
  await testService.deleteAllUser();
};

describe('AddressController', () => {
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

  interface Tokens {
    accessToken: string;
    refreshToken: string;
    signedAccessToken: string;
    signedRefreshToken: string;
  }

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

  describe('POST /api/v1/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
      await testService.createManyContacts();
    });

    afterEach(async () => {
      await testService.deleteAllAddress();
      await testService.deleteAllContact();
      await testService.deleteAllUser();
    });

    it('should be able to create address', async () => {
      const tokens: Tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .post(`/api/v1/contacts/${contact!.id}/addresses`)
        .send({
          street: 'example street',
          city: 'example city',
          province: 'example province',
          country: 'example country',
          postalCode: '12345',
        })
        .set('Cookie', [tokens.signedAccessToken]);

      const body = response.body as WebResponse<CreateAddressRes>;
      logger.info(response.body);
      expect(response.status).toBe(201);
      expect(body.data.id).toBeDefined();
      expect(body.data.street).toBe('example street');
      expect(body.data.city).toBe('example city');
      expect(body.data.province).toBe('example province');
      expect(body.data.country).toBe('example country');
      expect(body.data.postalCode).toBe('12345');
    });

    it('should be rejected if request is invalid', async () => {
      const tokens: Tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .post(`/api/v1/contacts/${contact!.id}/addresses`)
        .send({
          street: '',
          city: '',
          province: '',
          country: ' ',
          postalCode: '',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as ErrorResponseBody;

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await startTest(testService);
    });

    afterEach(async () => {
      await endTest(testService);
    });

    it('should be able to get a;; addresses', async () => {
      const contact: Contact | null = await testService.getContactId();
      const tokens: Tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact!.id}/addresses`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<GetAddressRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(2);
      expect(body.data[0].id).toBeDefined();
      expect(body.data[0].street).toBe('example street');
      expect(body.data[0].city).toBe('example city');
      expect(body.data[0].province).toBe('example province');
      expect(body.data[0].country).toBe('example country');
      expect(body.data[0].postalCode).toBe('12345');
    });
  });
});
