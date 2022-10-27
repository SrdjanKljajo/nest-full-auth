import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  //UseFilters,
} from '@nestjs/common';
//import { JwtExceptionFilter } from 'src/exceptions/jwt-exception';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Get('activate/:token')
  activateAccount(@Param('token') token: string) {
    return this.authService.аctivateAccount(token);
  }

  @Get('reset/:token')
  resetPasswordToken(@Param('token') token: string) {
    return this.authService.resetPasswordToken(token);
  }

  @Post('signup/:token')
  //@UseFilters(new JwtExceptionFilter())
  signup(@Param('token') token: string) {
    return this.authService.signup(token);
  }

  @Put('forgot-password')
  forgotPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Patch('reset-password/:token')
  resetPassword(@Param('token') token: string) {
    return this.authService.resetPassword(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(): Promise<boolean> {
    return this.authService.logout();
  }
}
