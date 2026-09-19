import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserService } from '../users/users.service';

@Module({
  controllers: [AdminController],
  providers: [UserService],
})
export class AdminModule {}
