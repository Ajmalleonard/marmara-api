import { Field, ObjectType, ID } from '@nestjs/graphql';

export enum VisaRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@ObjectType()
export class VisaRequest {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  nationality: string;

  @Field()
  visaType: string;

  @Field()
  arrivalDate: string;

  @Field()
  departureDate: string;

  @Field({ nullable: true })
  additionalInfo?: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;
}
