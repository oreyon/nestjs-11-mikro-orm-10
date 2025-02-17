import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}

  createPayload(userId: number): JwtPayload {
    return {
      jti: uuidv4(),
      sub: String(userId),
      iat: Math.floor(Date.now() / 1000),
    };
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
