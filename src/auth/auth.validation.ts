import { z, ZodType } from 'zod';
import { RegisterRequest } from './dto/auth.dto';

export class AuthValidation {
  static readonly REGISTER: ZodType<RegisterRequest> = z.object({
    email: z.string().email().min(6).max(100),
    password: z.string().min(6).max(100),
    username: z.string().min(6).max(100),
  });
}
