import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/user.entity';

export class RegisterRequest {
  @ApiProperty({
    description: 'Email address of the user',
    format: 'email',
    minimum: 6,
    maximum: 100,
    example: 'example@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    format: 'text',
    minimum: 6,
    maximum: 100,
    example: 'example',
  })
  password: string;

  @ApiProperty({
    description: 'Username of the user',
    format: 'text',
    minimum: 6,
    maximum: 100,
    example: 'example',
  })
  username: string;
}

export class RegisterResponse {
  email: string;
  username: string;
  emailVerificationToken?: string;
}

export class EmailVerificationRequest {
  @ApiProperty({
    description: 'Email address of the user',
    format: 'email',
    minimum: 6,
    maximum: 100,
    example: 'example@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Token verification email',
    format: 'text',
    minimum: 6,
    maximum: 100,
    example: 'secret',
  })
  emailVerificationToken: string;
}

export class EmailVerificationResponse {
  email: string;
  role?: Role;
  isVerified?: boolean;
  verifiedTime?: Date;
}

export class LoginRequest {
  @ApiProperty({
    description: 'Email address of the user',
    format: 'email',
    minimum: 6,
    maximum: 100,
    example: 'example@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    format: 'text',
    minimum: 6,
    maximum: 100,
    example: 'example',
  })
  password: string;
}

export class LoginResponse {
  email: string;
  username: string;
  accessToken?: string;
  refreshToken?: string;
}

export class CurrentUserResponse {
  email: string;
  username: string;
  role: Role;
  image?: string;
}

export class RefreshTokenRequest {
  @ApiProperty({
    description: 'Refresh token of the user',
    format: 'text',
    minimum: 6,
    maximum: 255,
    example: 'JSONWebToken',
  })
  refreshToken: string;
}

export class RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class ForgotPasswordRequest {
  @ApiProperty({
    description: 'Email address of the user',
    format: 'email',
    minimum: 6,
    maximum: 100,
    example: 'example@example.com',
  })
  email: string;
}

export class ForgotPasswordResponse {
  email: string;
  passwordResetToken: string;
}

export class ResetPasswordRequest {
  @ApiProperty({
    description: 'Email address of the user',
    format: 'email',
    minimum: 6,
    maximum: 100,
    example: 'example@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'New password of the user',
    format: 'text',
    minimum: 6,
    maximum: 100,
    example: 'updatedexamplepassword',
  })
  newPassword: string;

  @ApiProperty({
    description: 'New password of the user',
    format: 'text',
    minimum: 6,
    maximum: 100,
    example: 'updatedexamplepassword',
  })
  repeatNewPassword: string;

  @ApiProperty({
    description: 'Reset password token',
    format: 'text',
    minimum: 6,
    maximum: 100,
    example: 'secret',
  })
  resetPasswordToken: string;
}

export class ResetPasswordResponse {
  email: string;
  username: string;
}
