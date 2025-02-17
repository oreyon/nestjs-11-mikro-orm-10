import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'node:crypto';
import { SentMessageInfo } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface ISendEmail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface ISendVerificationEmail {
  name: string;
  email: string;
  verificationToken: string;
  origin: string;
}

interface ISendResetPasswordEmail {
  name: string;
  email: string;
  resetToken: string;
  origin: string;
}

@Injectable()
export class NodemailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: `${configService.get('NODEMAILER_SERVICE')}`,
      host: `${configService.get('NODEMAILER_HOST')}`,
      port: Number(`${configService.get('NODEMAILER_PORT')}`),
      secure: configService.get<string>('NODEMAILER_SECURE') === 'true',
      auth: {
        user: `${configService.get('NODEMAILER_USER')}`,
        pass: `${configService.get('NODEMAILER_PASSWORD')}`,
      },
      tls: {
        rejectUnauthorized:
          configService.get<string>('NODEMAILER_SECURE') === 'true',
      },
      requireTLS: configService.get<string>('NODEMAILER_SECURE') === 'true',
      debug: configService.get<string>('NODEMAILER_DEBUG') === 'true',
      logger: configService.get<string>('NODEMAILER_LOGGER') === 'true',
    });
  }

  async sendEmail(data: ISendEmail): Promise<SentMessageInfo> {
    try {
      return await this.transporter.sendMail({
        from: String(data.from),
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
    } catch (error) {
      console.error(`Error sending email: ${error}`);
      throw error;
    }
  }

  async sendVerificationEmail({
    name,
    email,
    verificationToken,
    origin,
  }: ISendVerificationEmail): Promise<SentMessageInfo> {
    const verifyEmailURL = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

    const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Email Verification</h2>
      <p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
      <a href="${verifyEmailURL}" 
         style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>If the button above doesn’t work, you can also verify your email by copying and pasting the following link into your browser:</p>
      <p><a href="${verifyEmailURL}" style="color: #4CAF50;">${verifyEmailURL}</a></p>
      <p style="font-size: 12px; color: #888;">If you did not request this email, please ignore it.</p>
    </div>
    `;

    return await this.sendEmail({
      from: this.configService.get('NODEMAILER_FROM') as string,
      to: email,
      subject: 'Email Verification',
      html: `<h4>Hello ${name},</h4> ${message}`,
    });
  }

  async sendResetPasswordEmail({
    name,
    email,
    resetToken,
    origin,
  }: ISendResetPasswordEmail): Promise<SentMessageInfo> {
    const resetURL = `${origin}/user/reset-password?token=${resetToken}&email=${email}`;
    const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #FF5722;">Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <a href="${resetURL}" 
         style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #FF5722; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
      <p><a href="${resetURL}" style="color: #FF5722;">${resetURL}</a></p>
      <p style="font-size: 12px; color: #888;">If you didn’t request a password reset, you can safely ignore this email.</p>
    </div>
    `;

    return await this.sendEmail({
      from: this.configService.get('NODEMAILER_FROM') as string,
      to: email,
      subject: 'Reset Your Password',
      html: `<h4>Hello ${name},</h4> ${message}`,
    });
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }
}
