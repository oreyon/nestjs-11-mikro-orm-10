import { INestApplication, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Role, User } from '../src/auth/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import { ForgotPasswordResponse } from '../src/auth/dto/auth.dto';
import { Contact } from '../src/contact/entities/contact.entity';

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

@Injectable()
export class TestService {
  constructor(private readonly em: EntityManager) {}

  async deleteAllUser() {
    const em = this.em.fork();
    await em.nativeDelete(User, {});
    await em.flush();
  }

  async createUser() {
    const em = this.em.fork();
    const user: User = em.create(User, {
      email: 'example@example.com',
      password: await bcrypt.hash('example', 10),
      username: 'example',
      role: Role.ADMIN,
      emailVerificationToken: 'secret',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await em.persistAndFlush(user);
  }

  async verifyEmail() {
    const em = this.em.fork();
    const user = await em.findOne(User, { email: 'example@example.com' });
    if (user) {
      user.isVerified = true;
      user.verifiedTime = new Date();
      user.emailVerificationToken = '';
      await em.flush();
    }
  }

  async login(app: INestApplication) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'example@example.com',
        password: 'example',
      });

    const body = response.body as WebResponse<{
      accessToken: string;
      refreshToken: string;
    }>;

    const cookies = response.header['set-cookie'];
    expect(cookies).toBeDefined();
    console.log(cookies);

    return {
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken,
      signedAccessToken: cookies[0],
      signedRefreshToken: cookies[1],
    };
  }

  async forgotPassword(app: INestApplication) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'example@example.com',
      });

    const body = response.body as WebResponse<ForgotPasswordResponse>;
    return {
      email: body.data.email,
      passwordResetToken: body.data.passwordResetToken,
    };
  }

  async getUserId(): Promise<User | null> {
    const em = this.em.fork(); // Fork EntityManager for isolated context
    return await em.findOne(User, { username: 'example' });
  }

  async deleteAllContact() {
    const em = this.em.fork();
    await em.nativeDelete(Contact, {});
    await em.flush();
  }
}
