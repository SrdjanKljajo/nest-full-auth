import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: AuthDto): Promise<any> {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Passwords dont match');
    //create confirmation token
    const token = await this.authToken(dto.username, dto.email, dto.password);
    // send confirmation mail
    await this.mailService.sendUserConfirmation(dto, token);
    return {
      status: 'success',
      message: `Email sent to address ${dto.email}. Follow instructions to activate account`,
    };
  }

  async аctivateAccount(token: string) {
    return {
      msg: 'Use confirmation token in url for registration',
      confirmToken: token,
    };
  }

  async resetPasswordToken(token: string) {
    return {
      msg: 'Use this token in url for reset password',
      resetToken: token,
    };
  }

  async signup(token: string) {
    try {
      this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') }) as any;
      const { username, email, password } = this.jwt.decode(token) as any;
      // generate the password hash
      const hash = await argon.hash(password);
      const newUser = await this.prisma.user.create({
        data: {
          username,
          email,
          hash,
        },
      });
      return this.signToken(newUser.id, newUser.email);
    } catch (error) {
      if (error.name == 'JsonWebTokenError') {
        throw new BadRequestException('Token is not valid!');
      }
      if (error.name == 'TokenExpiredError') {
        throw new BadRequestException('Token has expiried!');
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User with this email alredy exist');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Passwords dont match');
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(user.id, user.email);
  }

  async forgotPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException('Passwords dont match');
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does not exist throw exception
    if (!user)
      throw new NotFoundException(`User with email ${dto.email} is not found`);
    //create confirmation token
    const token = await this.resetToken(dto.password);
    // send confirmation mail
    await this.mailService.sendTokenReset(dto, token);

    return {
      status: 'success',
      message: `Email sent to address ${dto.email}. Follow instructions to reset password`,
    };
  }

  async resetPassword(token: string) {
    try {
      this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') }) as any;
      const { password } = this.jwt.decode(token) as any;
      // generate the password hash
      const hash = await argon.hash(password);
      // save the new user in the db
      await this.prisma.user.updateMany({
        data: {
          hash,
        },
      });
      return {
        msg: 'Password is updated successfuly. Please log in',
      };
    } catch (error) {
      if (error.name == 'JsonWebTokenError') {
        throw new BadRequestException('Token is not valid!');
      }
      if (error.name == 'TokenExpiredError') {
        throw new BadRequestException('Token has expiried!');
      }
      throw error;
    }
  }

  async logout(): Promise<any> {
    return 'logout';
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60d',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async resetToken(password: string) {
    const payload = {
      password,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '10m',
      secret: secret,
    });

    return token;
  }

  async authToken(username: string, email: string, password: string) {
    const payload = {
      username,
      email,
      password,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '10m',
      secret: secret,
    });

    return token;
  }
}
