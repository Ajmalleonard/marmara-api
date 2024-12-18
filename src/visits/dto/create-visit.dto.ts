import { IsString, IsOptional } from 'class-validator';

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
}
