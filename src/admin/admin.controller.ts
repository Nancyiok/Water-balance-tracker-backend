import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserService } from '../users/users.service';

@ApiTags("Admin")
@ApiBearerAuth()
@Roles("admin")
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {
  }

  @Get("users")
  @ApiOperation({summary: "List all users - admin only"})
  findAll() {
    return this.userService.findAll();
  }

  @Delete("users/:id")
  @ApiOperation({summary: "Delete user - admin only"})
  remove(@Param("id") id: String){
    return this.userService.remove(+id)
  }
}
