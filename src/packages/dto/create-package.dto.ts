import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ActivityDto {
  @IsString()
  title: string;
}

export class ItineraryDto {
  @IsNumber()
  @Min(1)
  day: number;

  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  activities: ActivityDto[];
}

export class IncludedItemDto {
  @IsString()
  title: string;
}

export class ExcludedItemDto {
  @IsString()
  title: string;
}

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsNumber()
  @Min(1)
  days: number;

  @IsNumber()
  @Min(1)
  nights: number;

  @IsNumber()
  @IsOptional()
  minimum_people?: number;

  @IsNumber()
  @IsOptional()
  maximum_people?: number;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsString()
  descriptions: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  destination: string;

  @IsNumber()
  @IsOptional()
  lower_price?: number;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDto)
  itinerary: ItineraryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncludedItemDto)
  included: IncludedItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExcludedItemDto)
  excluded: ExcludedItemDto[];

  @IsBoolean()
  @IsOptional()
  isMemberOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  isVip?: boolean;
}
