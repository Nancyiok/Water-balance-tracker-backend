import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { UserModule } from '../users/users.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
