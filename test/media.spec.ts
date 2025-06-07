import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
const configService = new ConfigService();
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { UploadApiResponse } from 'cloudinary';
// import * as jest from 'jest';
import { Server } from 'https';

describe('MediaController', () => {
  let app: INestApplication<Server>;
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

  describe('PUT /api/v1/media/upload', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    it('should be reject upload image if name parameter is invalid', async () => {
      const tokens: Tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .put('/api/v1/media/upload')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .attach('file', 'test/assets/asset-img-test-2.jpg');

      const body = response.body as ErrorResponseBody;
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be able to upload image to cloud storage', async () => {
      const tokens: Tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .put('/api/v1/media/upload')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .attach('image', 'test/assets/asset-img-test-2.jpg');

      const body = response.body as WebResponse<UploadApiResponse>;
      expect(response.status).toBe(200);
      expect(body.data.secure_url).toBeDefined();
      const secureUrl = body.data.secure_url;

      const deleteResponse = await request(app.getHttpServer())
        .delete('/api/v1/media/remove')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .send({ secureUrl });

      const deleteBody = deleteResponse.body as WebResponse<{ result: string }>;
      expect(deleteResponse.status).toBe(200);
      expect(deleteBody.data.result).toBe('ok');
    });
  });

  describe('PUT /api/v1/media/upload-multiple', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    /*
    it('should be reject upload image if name parameter is invalid', async () => {
      const tokens: Tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .put('/api/v1/media/upload-multiple')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .attach('files', 'test/assets/asset-img-test-2.jpg')
        .attach('files', 'test/assets/asset-img-test-3.jpg');

      const body = response.body as ErrorResponseBody;
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

     */

    it('should be able to upload image to cloud storage', async () => {
      const tokens: Tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .put('/api/v1/media/upload-multiple')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .attach('images', 'test/assets/asset-img-test-2.jpg')
        .attach('images', 'test/assets/asset-img-test-3.jpg');

      const body = response.body as WebResponse<UploadApiResponse[]>;
      expect(response.status).toBe(200);
      expect(body.data.length).toBe(2);
      const secureUrl1 = body.data[0].secure_url;
      const secureUrl2 = body.data[1].secure_url;

      const deleteResponse1 = await request(app.getHttpServer())
        .delete('/api/v1/media/remove')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .send({ secureUrl: secureUrl1 });
      const deleteBody1 = deleteResponse1.body as WebResponse<{
        result: string;
      }>;

      expect(deleteResponse1.status).toBe(200);
      expect(deleteBody1.data.result).toBe('ok');

      const deleteResponse2 = await request(app.getHttpServer())
        .delete('/api/v1/media/remove')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .send({ secureUrl: secureUrl2 });

      const deleteBody2 = deleteResponse2.body as WebResponse<{
        result: string;
      }>;
      expect(deleteResponse2.status).toBe(200);
      expect(deleteBody2.data.result).toBe('ok');
    });
  });

  describe('DELETE /api/v1/media/remove', () => {
    beforeEach(async () => {
      await testService.deleteAllUser();
      await testService.createUser();
      await testService.verifyEmail();
    });

    afterEach(async () => {
      await testService.deleteAllUser();
    });

    it('should be reject if secure url is invalid', async () => {
      const tokens: Tokens = await testService.login(app);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/media/remove')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .send({
          secureUrl: 'invalid-secure-url',
        });

      const body = response.body as ErrorResponseBody;
      expect(response.status).toBe(400);
      expect(body.errors).toBeDefined();
    });

    it('should be able to remove image from secure url', async () => {
      const tokens: Tokens = await testService.login(app);
      const uploadResponse = await request(app.getHttpServer())
        .put('/api/v1/media/upload')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .attach('image', 'test/assets/asset-img-test-2.jpg');

      const uploadBody = uploadResponse.body as WebResponse<UploadApiResponse>;

      expect(uploadResponse.status).toBe(200);
      expect(uploadBody.data.secure_url).toBeDefined();

      const secureUrl = uploadBody.data.secure_url; // Store the uploaded image URL

      const deleteResponse = await request(app.getHttpServer())
        .delete('/api/v1/media/remove')
        .set('Cookie', [`${tokens.signedAccessToken}`])
        .send({ secureUrl });

      const deleteBody = deleteResponse.body as WebResponse<{ result: string }>;

      expect(deleteResponse.status).toBe(200);
      expect(deleteBody.data.result).toBe('ok');
    });
  });

  // comented out due to local upload not implemented due to vercel compatibility deployment
  // describe('PUT /api/v1/media/upload-local', () => {
  //   beforeEach(async () => {
  //     await testService.deleteAllUser();
  //     await testService.createUser();
  //     await testService.verifyEmail();
  //   });

  //   afterEach(async () => {
  //     await testService.deleteAllUser();
  //   });

  //   it('should reject upload if image field name is invalid', async () => {
  //     const tokens: Tokens = await testService.login(app);

  //     const response = await request(app.getHttpServer())
  //       .put('/api/v1/media/upload-local')
  //       .set('Cookie', [`${tokens.signedAccessToken}`])
  //       .attach('file', 'test/assets/asset-img-test-2.jpg'); // Wrong field name

  //     const body = response.body as ErrorResponseBody;
  //     expect(response.status).toBe(400);
  //     expect(body.errors).toBeDefined();
  //   });

  //   it('should upload an image successfully', async () => {
  //     const tokens: Tokens = await testService.login(app);

  //     const response = await request(app.getHttpServer())
  //       .put('/api/v1/media/upload-local')
  //       .set('Cookie', [`${tokens.signedAccessToken}`])
  //       .attach('image', 'test/assets/asset-img-test-2.jpg');

  //     const body = response.body as WebResponse<UploadApiResponse>;
  //     expect(response.status).toBe(200);
  //     expect(body.data.imageUrl).toBeDefined();
  //   });
  // });

  // describe('PUT /api/v1/media/upload-multiple-local', () => {
  //   beforeEach(async () => {
  //     await testService.deleteAllUser();
  //     await testService.createUser();
  //     await testService.verifyEmail();
  //   });

  //   afterEach(async () => {
  //     await testService.deleteAllUser();
  //   });

  //   it('should upload multiple images successfully', async () => {
  //     const tokens: Tokens = await testService.login(app);

  //     const response = await request(app.getHttpServer())
  //       .put('/api/v1/media/upload-multiple-local')
  //       .set('Cookie', [`${tokens.signedAccessToken}`])
  //       .attach('images', 'test/assets/asset-img-test-2.jpg')
  //       .attach('images', 'test/assets/asset-img-test-3.jpg');

  //     const body = response.body as WebResponse<UploadApiResponse[]>;
  //     expect(response.status).toBe(200);
  //     expect(body.data.length).toBe(2);
  //     expect(body.data[0].imageUrl).toBeDefined();
  //     expect(body.data[1].imageUrl).toBeDefined();
  //   });
  // });

  // describe('GET /api/v1/media/:imageName', () => {
  //   beforeEach(async () => {
  //     await testService.deleteAllUser();
  //     await testService.createUser();
  //     await testService.verifyEmail();
  //   });

  //   afterEach(async () => {
  //     await testService.deleteAllUser();
  //   });

  //   it('should retrieve an uploaded image', async () => {
  //     const tokens: Tokens = await testService.login(app);

  //     const uploadResponse = await request(app.getHttpServer())
  //       .put('/api/v1/media/upload-local')
  //       .set('Cookie', [`${tokens.signedAccessToken}`])
  //       .attach('image', 'test/assets/asset-img-test-2.jpg');

  //     const uploadBody = uploadResponse.body as WebResponse<UploadApiResponse>;
  //     expect(uploadResponse.status).toBe(200);
  //     expect(uploadBody.data.imageUrl).toBeDefined();

  //     const imageName = uploadBody.data.imageName as string;

  //     const response = await request(app.getHttpServer()).get(
  //       `/api/v1/media/${imageName}`,
  //     );

  //     expect(response.status).toBe(200);
  //     expect(response.header['content-type']).toContain('image');
  //   });
  // });

  // describe('DELETE /api/v1/media/:imageName', () => {
  //   beforeEach(async () => {
  //     await testService.deleteAllUser();
  //     await testService.createUser();
  //     await testService.verifyEmail();
  //   });

  //   afterEach(async () => {
  //     await testService.deleteAllUser();
  //   });

  //   it('should delete an uploaded image', async () => {
  //     const tokens: Tokens = await testService.login(app);

  //     const uploadResponse = await request(app.getHttpServer())
  //       .put('/api/v1/media/upload-local')
  //       .set('Cookie', [`${tokens.signedAccessToken}`])
  //       .attach('image', 'test/assets/asset-img-test-2.jpg');

  //     const uploadBody = uploadResponse.body as WebResponse<UploadApiResponse>;
  //     expect(uploadResponse.status).toBe(200);
  //     expect(uploadBody.data.imageUrl).toBeDefined();

  //     const imageName = uploadBody.data.imageName as string;

  //     const deleteResponse = await request(app.getHttpServer())
  //       .delete(`/api/v1/media/${imageName}`)
  //       .set('Cookie', [`${tokens.signedAccessToken}`]);

  //     expect(deleteResponse.status).toBe(204);

  //     const getResponse = await request(app.getHttpServer()).get(
  //       `/api/v1/media/${imageName}`,
  //     );
  //     expect(getResponse.status).toBe(404);
  //   });

  //   it('should return 404 when deleting a non-existing image', async () => {
  //     const tokens: Tokens = await testService.login(app);

  //     const deleteResponse = await request(app.getHttpServer())
  //       .delete('/api/v1/media/nonexistent.jpg')
  //       .set('Cookie', [`${tokens.signedAccessToken}`]);

  //     const deleteBody = deleteResponse.body as ErrorResponseBody;
  //     expect(deleteResponse.status).toBe(404);
  //     expect(deleteBody.errors).toBe('File not found');
  //   });
  // });
});
