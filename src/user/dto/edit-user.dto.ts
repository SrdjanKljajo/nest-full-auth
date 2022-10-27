import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class EditUserDto {
  @IsEnum(UserRole, { each: true })
  @IsOptional()
  role?: UserRole;

  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  confirmPassword?: string;
}
