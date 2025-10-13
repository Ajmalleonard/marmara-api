import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsDateString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';

export enum CabinClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

export enum TravelClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

@InputType()
export class FlightSearchInput {
  @Field()
  @IsString()
  originLocationCode: string;

  @Field()
  @IsString()
  destinationLocationCode: string;

  @Field()
  @IsDateString()
  departureDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(9)
  adults: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  children?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  infants?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(TravelClass)
  travelClass?: TravelClass;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  includedAirlineCodes?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  excludedAirlineCodes?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(250)
  max?: number;

  @Field({ nullable: true })
  @IsOptional()
  nonStop?: boolean;
}

@InputType()
export class FlightInspirationInput {
  @Field()
  @IsString()
  origin: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  destination?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  max?: number;
}