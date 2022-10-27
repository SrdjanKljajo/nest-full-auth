import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUsers() {
    const usersCount = await this.prisma.user.count();
    const ages = await this.prisma.user.aggregate({
      _avg: {
        age: true,
      },
      _max: {
        age: true,
      },
      _min: {
        age: true,
      },
    });
    const users = await this.prisma.user.findMany({
      select: {
        username: true,
        age: true,
        country: true,
      },
      orderBy: {
        username: 'asc',
      },
    });
    return {
      allUsers: users,
      ageOfUsers: ages,
      numberOfUsers: usersCount,
    };
  }

  async editUserPassword(userId: number, dto: EditUserDto) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Passwords dont match');
    const hash = await argon.hash(dto.password);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hash,
      },
    });
    return {
      msg: 'You change password successfuly',
    };
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: dto.username,
        age: dto.age,
        country: dto.country,
      },
    });
    delete user.hash;
    return user;
  }

  async editRole(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: dto.role,
      },
    });
    return {
      msg: 'Role updated successfuly',
      newRole: user.role,
    };
  }

  async deleteUser(userId: number) {
    const deleteUserPosts = this.prisma.post.deleteMany({
      where: {
        userId,
      },
    });
    const deleteUser = this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return await this.prisma.$transaction([deleteUserPosts, deleteUser]);
  }
}
