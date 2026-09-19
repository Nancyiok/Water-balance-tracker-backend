import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user-create.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash: createUserDto.passwordHash,
        verificationToken: createUserDto.verificationToken,
        verificationTokenExpiresAt: createUserDto.verificationExpiresAt,
      },
    });
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findUnique({
      where: {
        resetToken: token,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto
      },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }
}
