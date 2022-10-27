import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AuthDto {
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

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
