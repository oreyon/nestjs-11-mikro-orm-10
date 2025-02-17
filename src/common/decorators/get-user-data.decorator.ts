import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';
import { Request } from 'express';

export const UserData = createParamDecorator<keyof User | undefined>(
  (data: keyof User | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.user) {
      throw new HttpException('Unauthenticated', 401);
    }

    if (data) {
      return request.user[data];
    }
    /*
    example request.user[data] = request.user['id']
    @UserData('id') will return request.user['id']
    @UserData('email') will return request.user['email
    * */

    return request.user;
  },
);
