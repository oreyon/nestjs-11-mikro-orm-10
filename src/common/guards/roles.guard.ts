import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role, User } from '../../auth/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: Role[] = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required
    }

    const request: Request = context.switchToHttp().getRequest();
    const user: User = request.user as User;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new HttpException('Account does not have permission', 403);
    }
    return true;
  }
}
