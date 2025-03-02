import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';
import { TokensResponse } from '../../model/token.model';
import * as bcrypt from 'bcryptjs';
import { EntityManager } from '@mikro-orm/mysql';
import { UserRepository } from '../../auth/user.repository';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
    private readonly userRepository: UserRepository,
  ) {}

  createPayload(userId: number): JwtPayload {
    return {
      jti: uuidv4(),
      sub: String(userId),
      iat: Math.floor(Date.now() / 1000),
    };
  }

  async createTokens(userId: number): Promise<TokensResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(this.createPayload(userId)),
      this.createRefreshToken(this.createPayload(userId)),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashRefreshToken: string = await bcrypt.hash(refreshToken, 10);
    const user: User = await this.userRepository.findOneOrFail(userId);
    user.refreshToken = hashRefreshToken;
    await this.em.flush();
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload;
  }

  createAccessToken(payload: JwtPayload): string {
    return jwt.sign(
      payload,
      this.configService.get('JWT_ACCESS_TOKEN_SECRET') as string,
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );
  }

  createRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      payload,
      this.configService.get('JWT_REFRESH_TOKEN_SECRET') as string,
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    );
  }

  verifyAccessToken(token: string): JwtPayload | string {
    return jwt.verify(
      token,
      this.configService.get('JWT_ACCESS_TOKEN_SECRET') as string,
    );
  }

  verifyRefreshToken(token: string): JwtPayload | string {
    return jwt.verify(
      token,
      this.configService.get('JWT_REFRESH_TOKEN_SECRET') as string,
    );
  }
}
