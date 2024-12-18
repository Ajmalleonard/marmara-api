import {
  IsDate,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsEnum,
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
  @Min(0)
  children?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  infants?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pets?: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
