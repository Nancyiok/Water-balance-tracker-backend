import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendVerificationEmail(email: string, token: string) {
    const appUrl = this.configService.get<string>('APP_URL');
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}`;
    await this.resend.emails.send({
      from: this.configService.get<string>('RESEND_FROM_EMAIL') ?? '',
      to: email,
      subject: 'Verify your email address',
      html: `<p>Please click the link below to verify your email address:</p><p><a href="${verificationUrl}">Verify Email</a></p>`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const appUrl = this.configService.get<string>('APP_URL');
    const verificationUrl = `${appUrl}/api/auth/reset-password?token=${token}`;
    await this.resend.emails.send({
        from: this.configService.get<string>('RESEND_FROM_EMAIL') ?? '',
        to: email,
        subject: 'Reset your password',
        html: `<p>Please click the link below to reset your password:</p><p><a href="${verificationUrl}">Reset Password</a></p>`,
    })
  }
}
