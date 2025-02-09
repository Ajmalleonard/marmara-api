import {
  IsString,
  IsBoolean,
  IsArray,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CenterDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreatePlaceDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsString()
  country: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsBoolean()
  isTop: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => CenterDto)
  center: CenterDto;
}
