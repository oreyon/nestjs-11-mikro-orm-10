import { z, ZodType } from 'zod';
import {
  CreateContactRequest,
  SearchContactReq,
  UpdateContactReq,
} from './dto/contact.dto';

export class ContactValidation {
  static readonly CREATE: ZodType<CreateContactRequest> = z.object({
    firstName: z.string().min(3).max(100),
    lastName: z.string().min(3).max(100).optional(),
    email: z.string().email().min(6).max(100).optional(),
    phone: z.string().min(6).max(20).optional(),
  });

  static readonly UPDATE: ZodType<UpdateContactReq> = z.object({
    id: z.number().positive(),
    firstName: z.string().min(3).max(100).optional(),
    lastName: z.string().min(3).max(100).optional(),
    email: z.string().email().min(6).max(100).optional(),
    phone: z.string().min(6).max(20).optional(),
  });

  static readonly SEARCH: ZodType<SearchContactReq> = z.object({
    username: z.string().min(3).max(100).optional(),
    email: z.string().email().min(6).max(100).optional(),
    phone: z.string().min(6).max(20).optional(),
    page: z.number().positive().min(1),
    size: z.number().positive().min(1),
    sortBy: z.string().optional(),
    orderBy: z.string().optional(),
  });
}
