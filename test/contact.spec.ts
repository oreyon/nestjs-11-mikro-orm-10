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
import {
  CreateContactResponse,
  GetContactResponse,
  SearchContactRes,
  UpdateContactRes,
} from '../src/contact/dto/contact.dto';
import { Contact } from '../src/contact/entities/contact.entity';
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

    it('should be able to create a contact', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({
          firstName: 'example',
          lastName: 'example',
          email: 'example@example.com',
          phone: '082134567890',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<CreateContactResponse>;

      logger.info(response.body);
      expect(response.status).toBe(201);
      expect(body.message).toBe('Success create contact');
      expect(body.data.id).toBeDefined();
      expect(body.data.firstName).toBe('example');
      expect(body.data.lastName).toBe('example');
      expect(body.data.email).toBe('example@example.com');
      expect(body.data.phone).toBe('082134567890');
    });
  });

  describe('GET /api/v1/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
    });

    it('should be rejected if accessToken is invalid', async () => {
      const contact: Contact | null = await testService.getContactId();

      console.log(`Contact Id: ${contact?.id}`);
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact?.id}`)
        .set('Cookie', [`accesstoken=wrongtoken`]);

      const body = response.body as WebResponse<GetContactResponse>;
      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(body.errors).toBeDefined();
    });

    it('should be rejected if contact is not found', async () => {
      const tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      console.log(`Contact Id: ${contact?.id}`);
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact!.id + 1}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<GetContactResponse>;
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(body.errors).toBeDefined();
    });

    it('should be able to get a contact with correct id', async () => {
      const tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      console.log(`Contact Id: ${contact?.id}`);
      const response = await request(app.getHttpServer())
        .get(`/api/v1/contacts/${contact?.id}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<GetContactResponse>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.message).toBe('Success get contact');
      expect(body.data.id).toBeDefined();
      expect(body.data.firstName).toBe('example');
      expect(body.data.lastName).toBe('example');
      expect(body.data.email).toBe('example@example.com');
      expect(body.data.phone).toBe('082109876543');
    });
  });

  describe('PATCH /api/v1/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
    });

    it('should be able to update contact', async () => {
      const tokens: Tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact?.id}`)
        .send({
          firstName: 'updateExample',
          lastName: 'updateExample',
          email: 'updateExample@example.com',
          phone: '082109876543',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<UpdateContactRes>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.message).toBe('Success update contact');
      expect(body.data.id).toBeDefined();
      expect(body.data.firstName).toBe('updateExample');
      expect(body.data.lastName).toBe('updateExample');
      expect(body.data.email).toBe('updateExample@example.com');
      expect(body.data.phone).toBe('082109876543');
    });

    it('should be rejected if contact does not exist', async () => {
      const tokens: Tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/contacts/${contact!.id + 1}`)
        .send({
          firstName: 'updateExample',
          lastName: 'updateExample',
          email: 'updateExample@example.com',
          phone: '082109876543',
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/v1/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
    });

    afterEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
    });

    it('should be rejected if contact did not exist', async () => {
      const tokens: Tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact!.id + 1}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(body.errors).toBeDefined();
    });

    it('should be able t delete contac', async () => {
      const tokens: Tokens = await testService.login(app);
      const contact: Contact | null = await testService.getContactId();

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/contacts/${contact?.id}`)
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<boolean>;
      logger.info(response.body);
      expect(response.status).toBe(204);
      expect(body.data).toBeUndefined();
    });
  });

  describe(`POST /api/v1/contacts/bulk`, () => {
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
        .post('/api/v1/contacts/bulk')
        .send([
          {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
          },
          {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
          },
        ])
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as ErrorResponseBody;
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be able to create many contacts', async () => {
      const tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/contacts/bulk')
        .send([
          {
            firstName: 'example',
            lastName: 'example',
            email: 'example@example.com',
            phone: '082134567890',
          },
          {
            firstName: 'Eko',
            lastName: 'Kurniawan',
            email: 'example@yopmail.com',
            phone: '082109876543',
          },
        ])
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<CreateContactResponse[]>;

      logger.info(response.body);
      expect(response.status).toBe(201);
      expect(body.message).toBe('Success create many contacts');
      expect(body.data.length).toBe(2);
      expect(body.data[0].id).toBeDefined();
      expect(body.data[0].firstName).toBe('example');
      expect(body.data[0].lastName).toBe('example');
      expect(body.data[0].email).toBe('example@example.com');
      expect(body.data[0].phone).toBe('082134567890');
    });
  });

  describe('GET /api/v1/contacts', () => {
    beforeEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
      await testService.createContact();
      await testService.createManyContacts();
    });

    afterEach(async () => {
      await testService.deleteAllContact();
      await testService.deleteAllUser();
    });

    it('should be able to get all contacts', async () => {
      const tokens: Tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(10);
      expect(body.paging.size).toBe(10);
      expect(body.paging.totalPage).toBe(2);
      expect(body.paging.currentPage).toBe(1);
    });

    it('should be able to search contact by username', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          username: 'example',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.paging.size).toBe(10);
      expect(body.paging.totalPage).toBe(1);
      expect(body.paging.currentPage).toBe(1);
    });

    it('should be able to search contact by email', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          email: 'example@example.com',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.paging.size).toBe(10);
      expect(body.paging.totalPage).toBe(1);
      expect(body.paging.currentPage).toBe(1);
    });

    it('should be able to search contact by phone', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          phone: '081234567904',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.paging.size).toBe(10);
      expect(body.paging.totalPage).toBe(1);
      expect(body.paging.currentPage).toBe(1);
    });

    it('should be able to search contact by username, email, and phone', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          username: 'example',
          email: 'example@example.com',
          phone: '082109876543',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.paging.size).toBe(10);
      expect(body.paging.totalPage).toBe(1);
      expect(body.paging.currentPage).toBe(1);
    });

    it('should be able to search contact even if username not found', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          username: 'notfound',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(0);
    });

    it('should be able to search contact even if email not found', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          email: 'wrongemail@wrong.com',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(0);
    });

    it('should be able to search contact even if phone not found', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          phone: '969696',
          page: 1,
          size: 10,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(0);
    });

    it('should be able to search contact with page', async () => {
      const tokens: Tokens = await testService.login(app);
      const response = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .query({
          page: 2,
          size: 1,
        })
        .set('Cookie', [`${tokens.signedAccessToken}`]);

      const body = response.body as WebResponse<SearchContactRes[]>;
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.paging.size).toBe(1);
      expect(body.paging.totalPage).toBe(16);
      expect(body.paging.currentPage).toBe(2);
    });
  });
});
