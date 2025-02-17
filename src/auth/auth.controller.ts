import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  EmailVerificationRequest,
  EmailVerificationResponse,
  RegisterRequest,
  RegisterResponse,
} from './dto/auth.dto';
import { WebResponse } from '../model/web.model';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post('register')
  async register(
    @Body() request: RegisterRequest,
  ): Promise<WebResponse<RegisterResponse>> {
    const response = await this.authService.register(request);
    return {
      message: 'User registered successfully',
      data: response,
    };
  }

  @ApiOperation({ summary: 'Verify a user email user' })
  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(
    @Body() request: EmailVerificationRequest,
  ): Promise<WebResponse<EmailVerificationResponse>> {
    // const result: EmailVerificationResponse =
    //   await this.authService.verifyEmail(request);

    return {
      message: 'Email verified successfully',
    };
  }
}
