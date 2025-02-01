import { IsString, IsOptional, IsDate } from 'class-validator';

export class CreateVisitDto {
  @IsString()
  page: string;

  @IsString()
  country: string;

  @IsString()
  userAgent: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsDate()
  @IsOptional()
  visitDate?: Date;
}
