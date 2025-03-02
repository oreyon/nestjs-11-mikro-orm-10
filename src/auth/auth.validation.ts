import { z, ZodString, ZodType } from 'zod';
import {
  EmailVerificationRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from './dto/auth.dto';

export class AuthValidation {
  static readonly REGISTER: ZodType<RegisterRequest> = z.object({
    email: z.string().email().min(6).max(100),
    password: z.string().min(6).max(100),
    username: z.string().min(6).max(100),
  });

  static readonly EMAIL_VERIFICATION: ZodType<EmailVerificationRequest> =
    z.object({
      email: z.string().email().min(6).max(100),
      emailVerificationToken: z.string().min(6).max(100),
    });

  static readonly LOGIN: ZodType<LoginRequest> = z.object({
    email: z.string().email().min(6).max(100),
    password: z.string().min(6).max(100),
  });

  static readonly REFRESH_TOKEN: ZodString = z.string().min(6).max(255);

  static readonly FORGOT_PASSWORD: ZodType<ForgotPasswordRequest> = z.object({
    email: z.string().email().min(6).max(100),
  });

  static readonly RESET_PASSWORD: ZodType<ResetPasswordRequest> = z
    .object({
      email: z.string().email().min(6).max(100),
      newPassword: z.string().min(6).max(100),
      repeatNewPassword: z.string().min(6).max(100),
      resetPasswordToken: z.string().min(6).max(100),
    })
    .refine(
      (data: ResetPasswordRequest): boolean =>
        data.newPassword === data.repeatNewPassword,
      {
        message: 'Passwords do not match.',
        path: ['repeatNewPassword'],
      },
    );

  static readonly UPLOAD_IMAGE: ZodType = z.object({
    image: z
      .custom<Express.Multer.File>(
        (file: Express.Multer.File): boolean =>
          !!file?.buffer && !!file?.mimetype,
        {
          message: 'Invalid file.',
        },
      )
      .refine(
        (file: Express.Multer.File): boolean => file.size <= this.MAX_FILE_SIZE,
        {
          message: 'Max image size is 5MB.',
        },
      )
      .refine(
        (file: Express.Multer.File): boolean =>
          this.ACCEPTED_IMAGE_TYPES.includes(file.mimetype),
        {
          message: 'Only .jpg, .jpeg, .png and .webp formats are supported.',
        },
      ),
  });

  private static MAX_FILE_SIZE: number = 5000000;
  private static ACCEPTED_IMAGE_TYPES: string[] = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
}
