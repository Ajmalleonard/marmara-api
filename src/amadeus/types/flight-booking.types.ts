import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

// Enums
export enum FlightBookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  TICKETED = 'TICKETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED'
}

export enum BookingType {
  ONE_WAY = 'ONE_WAY',
  ROUND_TRIP = 'ROUND_TRIP',
  MULTI_CITY = 'MULTI_CITY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  OTHER = 'OTHER'
}

export enum CabinClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

// Register enums with GraphQL
registerEnumType(FlightBookingStatus, { name: 'FlightBookingStatus' });
registerEnumType(BookingType, { name: 'BookingType' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
registerEnumType(Gender, { name: 'Gender' });
registerEnumType(DocumentType, { name: 'DocumentType' });
registerEnumType(CabinClass, { name: 'CabinClass' });

@ObjectType('FlightEmergencyContact')
export class EmergencyContact {
  @Field()
  name: string;

  @Field()
  phone: string;

  @Field()
  relationship: string;
}

@ObjectType()
export class BookingContactInfo {
  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  countryCode: string;

  @Field(() => EmergencyContact, { nullable: true })
  emergencyContact?: EmergencyContact;
}

@ObjectType()
export class FlightBookingPassenger {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field()
  dateOfBirth: string;

  @Field(() => Gender)
  gender: Gender;

  @Field({ nullable: true })
  title?: string;

  @Field(() => DocumentType)
  documentType: DocumentType;

  @Field()
  documentNumber: string;

  @Field({ nullable: true })
  documentExpiry?: string;

  @Field()
  issuingCountry: string;

  @Field()
  nationality: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  isLeadPassenger: boolean;

  @Field(() => [String])
  specialRequests: string[];

  @Field({ nullable: true })
  frequentFlyerNumber?: string;

  @Field({ nullable: true })
  knownTravelerNumber?: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class FlightBookingSegment {
  @Field(() => ID)
  id: string;

  @Field()
  airline: string;

  @Field()
  airlineName: string;

  @Field()
  flightNumber: string;

  @Field({ nullable: true })
  operatingAirline?: string;

  @Field({ nullable: true })
  aircraft?: string;

  @Field({ nullable: true })
  aircraftName?: string;

  @Field()
  departureAirport: string;

  @Field()
  arrivalAirport: string;

  @Field({ nullable: true })
  departureTerminal?: string;

  @Field({ nullable: true })
  arrivalTerminal?: string;

  @Field()
  departureTime: string;

  @Field()
  arrivalTime: string;

  @Field()
  duration: string;

  @Field()
  bookingClass: string;

  @Field(() => CabinClass)
  cabin: CabinClass;

  @Field({ nullable: true })
  fareBasis?: string;

  @Field(() => Int)
  segmentNumber: number;

  @Field()
  isLayover: boolean;

  @Field({ nullable: true })
  layoverDuration?: string;

  @Field({ nullable: true })
  amadeusSegmentId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  amadeusData?: any;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class FlightBooking {
  @Field(() => ID)
  id: string;

  @Field()
  bookingReference: string;

  @Field({ nullable: true })
  amadeusBookingId?: string;

  @Field({ nullable: true })
  amadeusOfferId?: string;

  @Field()
  userId: string;

  @Field(() => FlightBookingStatus)
  status: FlightBookingStatus;

  @Field(() => BookingType)
  bookingType: BookingType;

  @Field(() => Float)
  totalPrice: number;

  @Field(() => Float)
  baseFare: number;

  @Field(() => Float)
  taxes: number;

  @Field(() => Float)
  fees: number;

  @Field()
  currency: string;

  @Field(() => [FlightBookingPassenger])
  passengers: FlightBookingPassenger[];

  @Field(() => BookingContactInfo)
  contactInfo: BookingContactInfo;

  @Field(() => [FlightBookingSegment])
  outboundFlights: FlightBookingSegment[];

  @Field(() => [FlightBookingSegment])
  returnFlights: FlightBookingSegment[];

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  paymentTransactionId?: string;

  @Field({ nullable: true })
  paymentDate?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  searchCriteria?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  selectedOfferData?: any;

  @Field()
  bookingDate: string;

  @Field()
  travelDate: string;

  @Field({ nullable: true })
  expiresAt?: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class FlightBookingResponse {
  @Field(() => FlightBooking)
  booking: FlightBooking;

  @Field()
  message: string;

  @Field()
  success: boolean;
}

@ObjectType()
export class BookingCancellationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  refundAmount?: number;

  @Field({ nullable: true })
  refundCurrency?: string;
}