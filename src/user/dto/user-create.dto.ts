import { IsEmail, IsString } from 'class-validator';
import { ApiProverty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;
  @IsString()
  @ApiProperty()
  name: string;
  passwordHash: string;
  verificationToken: string | null;
  isVerified?: boolean;
  verificationExpiresAt: Date | null;
}
