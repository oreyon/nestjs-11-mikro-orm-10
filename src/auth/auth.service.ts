import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { EntityManager } from '@mikro-orm/mysql';
import { UserRepository } from './user.repository';
import {
  CurrentUserResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './dto/auth.dto';
import { ValidationService } from '../common/validation/validation.service';
import { ConfigService } from '@nestjs/config';
import { AuthValidation } from './auth.validation';
import { Role, User } from './entities/user.entity';
import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TokensResponse } from '../model/token.model';
import { JwtService } from '../common/jwt/jwt.service';
import { Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private em: EntityManager,
    private userRepository: UserRepository,
    private configService: ConfigService,
    private nodemailerService: NodemailerService,
    private cloudinaryService: CloudinaryService,
    private jwtService: JwtService,
  ) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    this.logger.debug(`REGISTER USER: ${JSON.stringify(request)}`);

    const registerRequest: RegisterRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    );

    const emailAlreadyExists: User | null = await this.userRepository.findOne({
      email: registerRequest.email,
    });

    if (emailAlreadyExists)
      throw new HttpException('Email already exists', 400);

    const usernameAlreadyExists: number = await this.userRepository.count({
      username: registerRequest.username,
    });

    if (usernameAlreadyExists > 0)
      throw new HttpException('Username already exists', 400);

    const isFirstAccount: boolean = (await this.userRepository.count()) === 0;
    const role: Role = isFirstAccount ? Role.ADMIN : Role.USER;

    const emailVerificationToken: string =
      this.configService.get<string>('NODE_ENV') === 'development'
        ? 'secret'
        : crypto.randomBytes(40).toLocaleString('hex');

    // registerRequest.password = await argon2.hash(registerRequest.password);
    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user: User = this.userRepository.create({
      email: registerRequest.email,
      username: registerRequest.username,
      password: registerRequest.password,
      role: role,
      emailVerificationToken: emailVerificationToken,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(user);

    const frontEndOrigin: string = this.configService.get<string>(
      'IP_FRONTEND_ORIGIN',
    ) as string;

    // Send email verification email
    await this.nodemailerService.sendVerificationEmail({
      name: user.username,
      email: user.email,
      verificationToken: emailVerificationToken,
      origin: frontEndOrigin,
    });

    return {
      email: user.email,
      username: user.username,
      emailVerificationToken: user.emailVerificationToken,
    };
  }

  async verifyEmail(
    request: EmailVerificationRequest,
  ): Promise<EmailVerificationResponse> {
    this.logger.debug(`VERIFY EMAIL: ${JSON.stringify(request)}`);

    const verifyEmailRequest: EmailVerificationRequest =
      this.validationService.validate(
        AuthValidation.EMAIL_VERIFICATION,
        request,
      );

    const user: User | null = await this.userRepository.findOneOrFail(
      {
        email: verifyEmailRequest.email,
      },
      {
        failHandler: (): HttpException =>
          new HttpException('Invalid email address', 404),
      },
    );

    if (user.isVerified) {
      throw new HttpException('Email is already verified', 400);
    }

    if (
      verifyEmailRequest.emailVerificationToken !== user.emailVerificationToken
    ) {
      throw new HttpException('Invalid token', 400);
    }

    user.isVerified = true;
    user.verifiedTime = new Date();
    user.emailVerificationToken = '';
    await this.em.flush();

    return {
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      verifiedTime: user.verifiedTime,
    };
  }

  async login(
    request: LoginRequest,
    response: Response,
  ): Promise<LoginResponse> {
    this.logger.debug(`LOGIN: ${JSON.stringify(request)}`);

    const loginRequest: LoginRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    );

    const user: User | null = await this.userRepository.findOneOrFail(
      {
        email: loginRequest.email,
      },
      {
        failHandler: (): HttpException =>
          new HttpException('Invalid email or password', 401),
      },
    );

    if (!user.isVerified) {
      throw new HttpException('Email is not verified', 403);
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Invalid email or password', 401);
    }

    const tokens: TokensResponse = await this.jwtService.createTokens(user.id);
    await this.jwtService.updateRefreshToken(user.id, tokens.refreshToken);

    response.cookie('accesstoken', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      signed: true,
    });

    response.cookie('refreshtoken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      signed: true,
    });

    return {
      email: user.email,
      username: user.username,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getCurrentUser(user: User): Promise<CurrentUserResponse> {
    this.logger.debug(`GET CURRENT USER: ${JSON.stringify(user)}`);

    const profile: User = await this.userRepository.findOneOrFail(
      {
        id: user.id,
      },
      {
        failHandler: (): HttpException =>
          new HttpException('User not found', 404),
      },
    );

    return {
      email: profile.email,
      username: profile.username,
      role: profile.role,
      image: profile.image,
    };
  }

  async logout(user: User, response: Response): Promise<boolean> {
    this.logger.debug(`LOGOUT: ${JSON.stringify(user)}`);

    const userLogin: User = await this.userRepository.findOneOrFail(user.id, {
      failHandler: (): HttpException =>
        new HttpException('User not found', 404),
    });

    userLogin.refreshToken = '';
    await this.em.flush();

    response.clearCookie('accesstoken');
    response.clearCookie('refreshtoken');

    return true;
  }

  async refreshToken(
    refreshToken: string,
    response: Response,
  ): Promise<RefreshTokenResponse> {
    this.logger.debug(`REFRESH TOKEN: ${refreshToken}`);

    const validateRefreshToken: string = this.validationService.validate(
      AuthValidation.REFRESH_TOKEN,
      refreshToken,
    );

    if (!validateRefreshToken) {
      throw new HttpException('Invalid refresh token', 401);
    }

    const decodeToken: string | JwtPayload =
      this.jwtService.decodeToken(refreshToken);

    const userId: number | undefined = decodeToken.sub as number | undefined;

    if (!userId) {
      throw new HttpException('Invalid refresh token', 401);
    }

    const user: User | null = await this.userRepository.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new HttpException('Invalid refresh token', 401);
    }

    const isRefreshTokenValid: boolean = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new HttpException('Invalid refresh token', 401);
    }

    const newAccessToken: string = this.jwtService.createAccessToken(
      this.jwtService.createPayload(userId),
    );

    response.cookie('accesstoken', newAccessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      signed: true,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: user.refreshToken,
    };
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    this.logger.debug(`FORGOT PASSWORD: ${JSON.stringify(request)}`);

    const forgotPasswordRequest: ForgotPasswordRequest =
      this.validationService.validate(AuthValidation.FORGOT_PASSWORD, request);

    const user: User | null = await this.userRepository.findOne({
      email: forgotPasswordRequest.email,
    });

    if (!user) {
      throw new HttpException('Invalid email address', 400);
    }

    if (!user.isVerified) {
      throw new HttpException('Email is not verified', 403);
    }

    const forgotToken: string =
      this.configService.get<string>('NODE_ENV') === 'development'
        ? 'secret'
        : crypto.randomBytes(40).toString('hex');

    const hashForgotToken: string = await argon2.hash(forgotToken);

    const frontEndOrigin: string = this.configService.get(
      'IP_FRONTEND_ORIGIN',
    ) as string;

    await this.nodemailerService.sendResetPasswordEmail({
      email: user.email,
      name: user.username,
      resetToken: forgotToken,
      origin: frontEndOrigin,
    });

    const expirationTime: Date = new Date(Date.now() + 30 * 1000); // 30 seconds
    console.log('Expiration Time:', expirationTime);

    user.passwordResetToken = hashForgotToken;
    user.passwordResetTokenExpirationTime = expirationTime;
    await this.em.flush();

    return {
      email: user.email,
      passwordResetToken: user.passwordResetToken,
    };
  }

  async resetPassword(
    request: ResetPasswordRequest,
    response: Response,
  ): Promise<ResetPasswordResponse> {
    this.logger.debug(`RESET PASSWORD: ${JSON.stringify(request)}`);

    const resetRequest: ResetPasswordRequest = this.validationService.validate(
      AuthValidation.RESET_PASSWORD,
      request,
    );

    const user: User = await this.userRepository.findOneOrFail(
      {
        email: resetRequest.email,
      },
      {
        failHandler: (): HttpException =>
          new HttpException('Invalid email address', 400),
      },
    );

    if (!user || !user.passwordResetToken) {
      throw new HttpException('Invalid user or reset token', 400);
    }

    if (
      !user.passwordResetTokenExpirationTime ||
      user.passwordResetTokenExpirationTime < new Date()
    ) {
      throw new HttpException('Token has expired', 400);
    }

    const isTokenValid: boolean = await argon2.verify(
      user.passwordResetToken,
      resetRequest.resetPasswordToken,
    );

    if (!isTokenValid) {
      throw new HttpException('Invalid reset token', 400);
    }

    await this.em.transactional(async (em) => {
      // user.password = await bcrypt.hash(resetRequest.newPassword, 10);
      user.password = await argon2.hash(resetRequest.newPassword);
      user.passwordResetToken = '';
      user.passwordResetTokenExpirationTime = undefined;
      await em.flush();
    });

    response.clearCookie('accesstoken');
    response.clearCookie('refreshtoken');

    return {
      email: user.email,
      username: user.username,
    };
  }
}
