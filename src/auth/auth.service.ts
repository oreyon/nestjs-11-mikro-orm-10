import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { EntityManager } from '@mikro-orm/mysql';
import { UserRepository } from './user.repository';
import { RegisterRequest, RegisterResponse } from './dto/auth.dto';
import { ValidationService } from '../common/validation/validation.service';
import { ConfigService } from '@nestjs/config';
import { AuthValidation } from './auth.validation';
import { Role, User } from './entities/user.entity';
import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
// import * as bcrypt from 'bcrypt';

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
  ) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    this.logger.debug(`REGISTER USER: ${JSON.stringify(request)}`);

    const registerRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    );

    const emailAlreadyExists = await this.userRepository.findOne({
      email: registerRequest.email,
    });

    if (emailAlreadyExists)
      throw new HttpException('Email already exists', 400);

    const usernameAlreadyExists = await this.userRepository.count({
      username: registerRequest.username,
    });

    if (usernameAlreadyExists > 0)
      throw new HttpException('Username already exists', 400);

    const isFirstAccount: boolean = (await this.userRepository.count()) === 0;
    const role: Role = isFirstAccount ? Role.ADMIN : Role.USER;

    const emailVerificationToken =
      this.configService.get<string>('NODE_ENV') === 'development'
        ? 'secret'
        : crypto.randomBytes(40).toLocaleString('hex');

    registerRequest.password = await argon2.hash(registerRequest.password);

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

    const frontEndOrigin = this.configService.get<string>(
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
}
