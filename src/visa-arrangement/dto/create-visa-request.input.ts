import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateVisaRequestInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  nationality: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  visaType: string;

  @Field()
  @IsNotEmpty()
  arrivalDate: string;

  @Field()
  @IsNotEmpty()
  departureDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
