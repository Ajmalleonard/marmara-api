import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsString()
  userId: string;

  @IsString()
  packageId: string;

  @IsEnum(['pending', 'confirmed', 'completed', 'canceled'])
  status: string;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsNumber()
  @Min(1)
  adults: number;

  @IsNumber()
  @IsOptional()
  children?: number;

  @IsNumber()
  @IsOptional()
  infants?: number;

  @IsNumber()
  @IsOptional()
  pets?: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
