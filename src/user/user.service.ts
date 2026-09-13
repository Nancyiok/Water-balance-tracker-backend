import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user-create.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash: createUserDto.passwordHash,
        verificationToken: createUserDto.verificationToken,
        verificationExpiresAt: createUserDto.verificationExpiresAt,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
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
        name: updateUserDto.name,
        passwordHash: updateUserDto.passwordHash,
        refreshTokenHash: updateUserDto.refreshTokenHash,
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
