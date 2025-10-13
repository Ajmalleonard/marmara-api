import { IsString, IsDateString, IsOptional, IsInt, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TravelClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

export class FlightSearchDto {
  @IsString()
  originLocationCode: string;

  @IsString()
  destinationLocationCode: string;

  @IsDateString()
  departureDate: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsInt()
  @Min(1)
  @Max(9)
  @Transform(({ value }) => parseInt(value))
  adults: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  @Transform(({ value }) => parseInt(value))
  children?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  @Transform(({ value }) => parseInt(value))
  infants?: number;

  @IsOptional()
  @IsEnum(TravelClass)
  travelClass?: TravelClass;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  nonStop?: boolean;

  @IsOptional()
  @IsString()
  currencyCode?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(250)
  @Transform(({ value }) => parseInt(value))
  max?: number;
}

export class FlightInspirationDto {
  @IsString()
  origin: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  maxPrice?: number;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  oneWay?: boolean;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  nonStop?: boolean;

  @IsOptional()
  @IsEnum(['COUNTRY', 'CITY', 'DESTINATION'])
  viewBy?: 'COUNTRY' | 'CITY' | 'DESTINATION';
}

export class FlightBookingDto {
  flightOffer: any; // This will be the FlightOffer from search results

  travelers: any[]; // This will be Traveler[] from interfaces

  @IsOptional()
  contacts?: any[]; // This will be Contact[] from interfaces

  @IsOptional()
  remarks?: {
    general?: Array<{
      subType: string;
      text: string;
    }>;
  };
}

export class AirportCitySearchDto {
  @IsString()
  keyword: string;

  @IsOptional()
  @IsString()
  subType?: 'AIRPORT' | 'CITY';

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  max?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  include?: boolean;
}

export class AirlineCodeLookupDto {
  @IsOptional()
  @IsString()
  airlineCodes?: string;

  @IsOptional()
  @IsString()
  IATACode?: string;

  @IsOptional()
  @IsString()
  ICAOCode?: string;
}