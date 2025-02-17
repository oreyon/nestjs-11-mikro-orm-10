import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { EntityManager } from '@mikro-orm/mysql';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request) as string;

    if (!token) {
      throw new HttpException('Unauthorized', 401);
    }

    try {
      const payload: string | JwtPayload =
        this.jwtService.verifyRefreshToken(token);
      const user: User | null = await this.em.findOne(User, {
        id: payload.sub as number | undefined,
      });

      if (!user) {
        new HttpException('Unauthorized', 401);
      }

      request.user = user as User;
      return true;
    } catch (error) {
      console.error(`Refresh token verification failed: ${error}`);
      throw new HttpException('Unauthorized', 401);
    }
  }

  private extractTokenFromHeader(request: Request): unknown {
    const authHeader: string | undefined = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }

    const tokenFromCookies: unknown = request.signedCookies['refreshtoken'];
    if (tokenFromCookies) {
      return tokenFromCookies;
    }

    return null;
  }
}
