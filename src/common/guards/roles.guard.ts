import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role, User } from '../../auth/entities/user.entity';
import { EntityManager } from '@mikro-orm/mysql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: Role[] = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request: Request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new HttpException('Unauthorized', 401);
    }

    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      throw new HttpException('Unauthorized', 401);
    }

    if (!requiredRoles.includes(user.role)) {
      throw new HttpException('Account does not have permission', 403);
    }

    // Optionally replace the lightweight request.user with the full user
    request.user = user;
    return true;
  }
}
