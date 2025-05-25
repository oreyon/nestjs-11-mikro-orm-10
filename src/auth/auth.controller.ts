import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
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
  UpdateCurrentUserRequest,
  UpdateCurrentUserResponse,
} from './dto/auth.dto';
import { WebResponse } from '../model/web.model';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AccessTokenGuard, RefreshTokenGuard } from '../common/guards';
import { UserData } from '../common/decorators';
import { User } from './entities/user.entity';

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
      message: 'Success register user',
      data: response,
    };
  }

  @ApiOperation({ summary: 'Verify a user email user' })
  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(
    @Body() request: EmailVerificationRequest,
  ): Promise<WebResponse<EmailVerificationResponse>> {
    const result: EmailVerificationResponse =
      await this.authService.verifyEmail(request);

    return {
      message: 'Success verifying email',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Login user' })
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<LoginResponse>> {
    const result: LoginResponse = await this.authService.login(
      request,
      response,
    );
    return {
      message: 'Login success',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get current user' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Get('current')
  async getCurrentUser(
    @UserData() user: User,
  ): Promise<WebResponse<CurrentUserResponse>> {
    const result: CurrentUserResponse =
      await this.authService.getCurrentUser(user);

    return {
      message: 'Success getting current user',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Update current user' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Patch('current')
  async updateCurrentUser(
    @UserData() user: User,
    @Body() request: UpdateCurrentUserRequest,
  ): Promise<WebResponse<UpdateCurrentUserResponse>> {
    const result: UpdateCurrentUserResponse =
      await this.authService.updateCurrentUser(user, request);

    return {
      message: 'Success update current user',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Logout user' })
  // @ApiBearerAuth()
  // @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Delete('logout')
  async logout(
    // @UserData() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<boolean>> {
    // await this.authService.logout(user, response);
    await this.authService.clearCookies(response);
    return {
      message: 'Logout success',
      data: true,
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<RefreshTokenResponse>> {
    let refreshToken: string =
      (request.headers.authorization as string) ||
      (request.signedCookies['refreshtoken'] as string);

    if (refreshToken && refreshToken.split(' ')[0] === 'Bearer') {
      refreshToken = refreshToken.split(' ')[1];
    }

    if (!refreshToken) {
      throw new HttpException('Refresh token is missing', 400);
    }

    console.log('Refresh Token:', refreshToken);
    const result: RefreshTokenResponse = await this.authService.refreshToken(
      refreshToken,
      response,
    );

    return {
      message: 'Success regenerate access token',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Forgot password via email' })
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(
    @Body() request: ForgotPasswordRequest,
  ): Promise<WebResponse<ForgotPasswordResponse>> {
    const result: ForgotPasswordResponse =
      await this.authService.forgotPassword(request);

    return {
      message: 'Success sent email for reset password',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Reset password via email' })
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(
    @Body() request: ResetPasswordRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<ResetPasswordResponse>> {
    const result: ResetPasswordResponse = await this.authService.resetPassword(
      request,
      response,
    );

    return {
      message: 'Success reset password',
      data: result,
    };
  }
}
