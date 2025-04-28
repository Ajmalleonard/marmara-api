import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

@InputType()
export class CreateCarBookingInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  pickupLocation: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  dropoffLocation: string;

  @Field()
  @IsNotEmpty()
  pickupDate: string;

  @Field()
  @IsNotEmpty()
  returnDate: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  vehicleType: string;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  withDriver: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
