import { z, ZodType } from 'zod';
import {
  CreateAddressReq,
  GetAddressReq,
  RemoveAddressReq,
  UpdateAddressReq,
} from './dto/address.dto';

export class AddressValidation {
  static readonly CREATE: ZodType<CreateAddressReq> = z.object({
    contactId: z.number().positive().min(1),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(10).optional(),
  });

  static readonly GET: ZodType<GetAddressReq> = z.object({
    contactId: z.number().positive().min(1),
    addressId: z.number().positive().min(1),
  });

  static readonly UPDATE: ZodType<UpdateAddressReq> = z.object({
    id: z.number().positive().min(1),
    contactId: z.number().positive().min(1),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(10).optional(),
  });

  static readonly REMOVE: ZodType<RemoveAddressReq> = z.object({
    contactId: z.number().positive().min(1),
    addressId: z.number().positive().min(1),
  });
}
