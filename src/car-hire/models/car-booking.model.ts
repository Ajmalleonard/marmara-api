import { Field, ObjectType, ID } from '@nestjs/graphql';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
}

@ObjectType()
export class CarBooking {
  @Field(() => ID)
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field()
  pickupLocation: string;

  @Field()
  dropoffLocation: string;

  @Field()
  pickupDate: string;

  @Field()
  returnDate: string;

  @Field()
  vehicleType: string;

  @Field()
  withDriver: boolean;

  @Field({ nullable: true })
  specialRequests?: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;
}
