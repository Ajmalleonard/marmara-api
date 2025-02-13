import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateVisitDto {
  @IsString()
  page: string;

  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  userAgent: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsDate()
  @IsOptional()
  visitDate?: Date;
}
