import { z, ZodType } from 'zod';
import { CreateContactRequest } from './dto/contact.dto';

export class ContactValidation {
  static readonly CREATE: ZodType<CreateContactRequest> = z.object({
    firstName: z.string().min(3).max(100),
    lastName: z.string().min(3).max(100).optional(),
    email: z.string().email().min(6).max(100).optional(),
    phone: z.string().min(6).max(20).optional(),
  });
}
