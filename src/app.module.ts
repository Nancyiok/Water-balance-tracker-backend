import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { ROLES_KEY } from './common/decorators/roles.decorator';
import { RoleGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    JwtModule.register({ global: true }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: ROLES_KEY,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
