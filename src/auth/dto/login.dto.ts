import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({example: "john.doe@example.com"})
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @ApiProperty({example: "password123"})
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}