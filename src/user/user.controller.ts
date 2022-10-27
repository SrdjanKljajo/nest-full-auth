import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { admin, moderator } from '../utils/roleHandler';
import { GetUser, Roles } from '../auth/decorator';
import { JwtGuard, RolesGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
  // if you want one item ( it is posible because of [data] in custom decorator)
  /*getMe(@GetUser('email') user: string) {
    return user;
  }*/

  @Get()
  @Roles(admin)
  async getUsers() {
    return this.userService.getUsers();
  }

  //@GetUser umesto @Param omogućava promene samo na logovanom korisniku
  @Patch('update-password/:id')
  editUserPassword(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUserPassword(userId, dto);
  }

  @Patch('update/:id')
  @Roles(moderator, admin)
  editUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editUser(userId, dto);
  }

  @Patch('update-role/:id')
  @Roles(admin)
  editRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editRole(userId, dto);
  }

  // ParseIntPipe konvertuje ID param string u broj
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(admin)
  deleteUser(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.deleteUser(userId);
  }
}
