import { Visibility } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(Visibility, { each: true })
  @IsOptional()
  visibility?: Visibility;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  subCategoryId?: number;

  @IsArray()
  @IsOptional()
  tags?: any;
}
