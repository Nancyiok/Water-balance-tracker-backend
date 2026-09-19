import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserService } from '../users/users.service';
import { EmailService } from './email.service';
import { type RegisterDto } from './dto/register.dto';
import { type LoginDto } from './dto/login.dto';
import { type Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await this.userService.create({
      email: registerDto.email,
      name: registerDto.name,
      passwordHash,
      verificationToken,
      verificationExpiresAt: verificationExpiresAt,
    });

    void this.emailService.sendVerificationEmail(
      registerDto.email,
      verificationToken,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string, res: Response) {
    const user = await this.userService.findByVerificationToken(token);
    console.log(user?.id);
    if (!user || !user.verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new one.',
      );
    }

    await this.userService.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      message: 'Email verified successfully. You are now logged in.',
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }
    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return {
        message:
          'If an account with this email exists, a reset link has been sent',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1hr
    console.log(resetTokenExpiresAt)
    await this.userService.update(user.id, {
      resetToken,
      resetTokenExpiresAt,
    });
    void this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'If an account with that email exists, a resent link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userService.findByResetToken(token);
    if (!user || !user.resetToken) {
      throw new BadRequestException('Invalid reset token');
    }
    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Reset token expired. Please request a new one',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    this.userService.update(user.id, {
      passwordHash,
      resetToken: null,
      verificationTokenExpiresAt: null,
    });

    return {
      message: 'Password reset succesfully. You can now login',
    };
  }

  async refresh(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    let payload: { sub: number; email: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.userService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const isRefreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenMatch) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
    };
  }

  async logout(userId: number, res: Response) {
    await this.userService.update(userId, { refreshTokenHash: null });
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { refreshTokenHash });
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
