import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/user.entity';

export class RegisterRequest {
  constructor(email: string, password: string, username: string) {
    this.email = email;
    this.password = password;
    this.username = username;
  }

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
  constructor(email: string, username: string) {
    this.email = email;
    this.username = username;
  }

  email: string;
  username: string;
  emailVerificationToken?: string;
}

export class EmailVerificationRequest {
  constructor(email: string, emailVerificationToken: string) {
    this.email = email;
    this.emailVerificationToken = emailVerificationToken;
  }

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
  constructor(
    email: string,
    role: Role,
    isVerified: boolean,
    verifiedTime: Date,
  ) {
    this.email = email;
    this.role = role;
    this.isVerified = isVerified;
    this.verifiedTime = verifiedTime;
  }

  email: string;
  role?: Role;
  isVerified?: boolean;
  verifiedTime?: Date;
}

export class LoginRequest {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

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
  constructor(
    email: string,
    username: string,
    accessToken: string,
    refreshToken: string,
  ) {
    this.email = email;
    this.username = username;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  email: string;
  username: string;
  accessToken?: string;
  refreshToken?: string;
}

export class CurrentUserResponse {
  constructor(email: string, username: string, role: Role, image?: string) {
    this.email = email;
    this.username = username;
    this.role = role;
    this.image = image;
  }

  email: string;
  username: string;
  role: Role;
  image?: string;
}

export class RefreshTokenRequest {
  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

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
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  accessToken: string;
  refreshToken: string;
}

export class ForgotPasswordRequest {
  constructor(email: string) {
    this.email = email;
  }

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
  constructor(email: string, passwordResetToken: string) {
    this.email = email;
    this.passwordResetToken = passwordResetToken;
  }

  email: string;
  passwordResetToken: string;
}

export class ResetPasswordRequest {
  constructor(
    email: string,
    newPassword: string,
    repeatNewPassword: string,
    resetPasswordToken: string,
  ) {
    this.email = email;
    this.newPassword = newPassword;
    this.repeatNewPassword = repeatNewPassword;
    this.resetPasswordToken = resetPasswordToken;
  }

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
  constructor(email: string, username: string) {
    this.email = email;
    this.username = username;
  }

  email: string;
  username: string;
}
