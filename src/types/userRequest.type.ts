import { User } from '../auth/entities/user.entity';

declare module 'express' {
  interface Request {
    user?: User;
  }
}
