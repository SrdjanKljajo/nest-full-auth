import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthDto } from '../auth/dto/auth.dto';
import { EditUserDto } from '../user/dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  async sendUserConfirmation(dto: AuthDto, token: string) {
    const url = `${this.config.get('CLIENT_URL')}/auth/activate/${token}`;

    await this.mailerService.sendMail({
      to: dto.email,
      subject: '`Activation token`',
      template: './confirmation',
      context: {
        user: dto.username,
        url,
      },
    });
  }

  async sendTokenReset(dto: EditUserDto, token: string) {
    const url = `http://localhost:3333/auth/reset/${token}`;

    await this.mailerService.sendMail({
      to: dto.email,
      subject: '`Reset password token`',
      template: './reset-token',
      context: {
        url,
      },
    });
  }
}
