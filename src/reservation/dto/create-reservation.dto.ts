import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsString()
  userId: string;

  @IsString()
  location: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  returnDate: string;

  @IsString()
  adults: string;

  @IsString()
  @IsOptional()
  children?: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  rooms: string;
}

export class PetsDto {
  @IsNumber()
  count: number;

  @IsString()
  type: string;

  @IsString()
  details: string;
}

export class TravelGroupDto {
  @IsNumber()
  adults: number;

  @IsNumber()
  children: number;

  @IsNumber()
  infants: number;

  @IsString()
  countryOfOrigin: string;

  @ValidateNested()
  @Type(() => PetsDto)
  @IsOptional()
  pets?: PetsDto;
}

export class BudgetDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;

  @IsIn(['USD', 'EUR'])
  currency: 'USD' | 'EUR';
}

export class ContactInfoDto {
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsBoolean()
  receiveUpdates: boolean;
}

export class FormattedTripDataDto {
  @ValidateNested()
  @Type(() => BudgetDto)
  budget: BudgetDto;

  @IsArray()
  @IsString({ each: true })
  activities: string[];

  @ValidateNested()
  @Type(() => TravelGroupDto)
  travelGroup: TravelGroupDto;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsOptional()
  aiResponse?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedImages?: string[];
}
