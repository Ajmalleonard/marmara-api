import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, IsArray, ValidateNested, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-type-json';
import { Gender, DocumentType } from '../types/flight-booking.types';

@InputType()
export class EmergencyContactInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  phone: string;

  @Field()
  @IsString()
  relationship: string;
}

@InputType()
export class ContactInfoInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  phone: string;

  @Field()
  @IsString()
  countryCode: string;

  @Field(() => EmergencyContactInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactInput)
  emergencyContact?: EmergencyContactInput;
}

@InputType()
export class PassengerInput {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  middleName?: string;

  @Field()
  @IsDateString()
  dateOfBirth: string;

  @Field(() => Gender)
  @IsEnum(Gender)
  gender: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => DocumentType)
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @Field()
  @IsString()
  documentNumber: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  documentExpiry?: string;

  @Field()
  @IsString()
  issuingCountry: string;

  @Field()
  @IsString()
  nationality: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field()
  @IsBoolean()
  isLeadPassenger: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialRequests?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  frequentFlyerNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  knownTravelerNumber?: string;
}

@InputType()
export class CreateFlightBookingInput {
  @Field(() => GraphQLJSON)
  flightOffer: any; // The selected flight offer from search results

  @Field(() => [PassengerInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerInput)
  passengers: PassengerInput[];

  @Field(() => ContactInfoInput)
  @ValidateNested()
  @Type(() => ContactInfoInput)
  contactInfo: ContactInfoInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  remarks?: {
    general?: Array<{
      subType: string;
      text: string;
    }>;
  };

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  searchCriteria?: any; // Store original search parameters
}

@InputType()
export class ModifyFlightBookingInput {
  @Field()
  @IsString()
  bookingId: string;

  @Field(() => [PassengerInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerInput)
  passengers?: PassengerInput[];

  @Field(() => ContactInfoInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoInput)
  contactInfo?: ContactInfoInput;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  remarks?: {
    general?: Array<{
      subType: string;
      text: string;
    }>;
  };
}

@InputType()
export class CancelFlightBookingInput {
  @Field()
  @IsString()
  bookingId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}

@InputType()
export class GetBookingInput {
  @Field()
  @IsString()
  bookingId: string;
}

@InputType()
export class GetUserBookingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}