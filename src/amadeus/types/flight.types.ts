import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class FlightEndpoint {
  @Field()
  iataCode: string;

  @Field({ nullable: true })
  terminal?: string;

  @Field()
  at: string;
}

@ObjectType()
export class Aircraft {
  @Field()
  code: string;
}

@ObjectType()
export class Operating {
  @Field()
  carrierCode: string;
}

@ObjectType()
export class FlightSegment {
  @Field(() => FlightEndpoint)
  departure: FlightEndpoint;

  @Field(() => FlightEndpoint)
  arrival: FlightEndpoint;

  @Field()
  carrierCode: string;

  @Field()
  number: string;

  @Field(() => Aircraft)
  aircraft: Aircraft;

  @Field(() => Operating, { nullable: true })
  operating?: Operating;

  @Field()
  duration: string;

  @Field(() => ID)
  id: string;

  @Field(() => Int)
  numberOfStops: number;

  @Field()
  blacklistedInEU: boolean;
}

@ObjectType()
export class Itinerary {
  @Field()
  duration: string;

  @Field(() => [FlightSegment])
  segments: FlightSegment[];
}

@ObjectType()
export class Fee {
  @Field(() => Float)
  amount: number;

  @Field()
  type: string;
}

@ObjectType()
export class Price {
  @Field()
  currency: string;

  @Field(() => Float)
  total: number;

  @Field(() => Float)
  base: number;

  @Field(() => [Fee])
  fees: Fee[];

  @Field(() => Float)
  grandTotal: number;
}

@ObjectType()
export class PricingOptions {
  @Field(() => [String])
  fareType: string[];

  @Field()
  includedCheckedBagsOnly: boolean;
}

@ObjectType()
export class IncludedCheckedBags {
  @Field(() => Int)
  quantity: number;
}

@ObjectType()
export class IncludedCabinBags {
  @Field(() => Int)
  quantity: number;
}

@ObjectType()
export class Amenity {
  @Field()
  description: string;

  @Field()
  isChargeable: boolean;

  @Field()
  amenityType: string;

  @Field(() => GraphQLJSON, { nullable: true })
  amenityProvider?: any;
}

@ObjectType()
export class FareDetailsBySegment {
  @Field()
  segmentId: string;

  @Field()
  cabin: string;

  @Field()
  fareBasis: string;

  @Field({ nullable: true })
  brandedFare?: string;

  @Field({ nullable: true })
  brandedFareLabel?: string;

  @Field()
  class: string;

  @Field(() => IncludedCheckedBags)
  includedCheckedBags: IncludedCheckedBags;

  @Field(() => IncludedCabinBags, { nullable: true })
  includedCabinBags?: IncludedCabinBags;

  @Field(() => [Amenity], { nullable: true })
  amenities?: Amenity[];
}

@ObjectType()
export class TravelerPricing {
  @Field()
  travelerId: string;

  @Field()
  fareOption: string;

  @Field()
  travelerType: string;

  @Field(() => Price)
  price: Price;

  @Field(() => [FareDetailsBySegment])
  fareDetailsBySegment: FareDetailsBySegment[];
}

@ObjectType()
export class FlightOffer {
  @Field()
  type: string;

  @Field(() => ID)
  id: string;

  @Field()
  source: string;

  @Field()
  instantTicketingRequired: boolean;

  @Field()
  nonHomogeneous: boolean;

  @Field()
  oneWay: boolean;

  @Field({ nullable: true })
  isUpsellOffer?: boolean;

  @Field()
  lastTicketingDate: string;

  @Field({ nullable: true })
  lastTicketingDateTime?: string;

  @Field(() => Int)
  numberOfBookableSeats: number;

  @Field(() => [Itinerary])
  itineraries: Itinerary[];

  @Field(() => Price)
  price: Price;

  @Field(() => PricingOptions)
  pricingOptions: PricingOptions;

  @Field(() => [String])
  validatingAirlineCodes: string[];

  @Field(() => [TravelerPricing])
  travelerPricings: TravelerPricing[];
}

@ObjectType()
export class LocationInfo {
  @Field()
  cityCode: string;

  @Field()
  countryCode: string;
}

@ObjectType()
export class FlightSearchMeta {
  @Field(() => Int)
  count: number;

  @Field(() => GraphQLJSON, { nullable: true })
  links?: any;
}

@ObjectType()
export class FlightSearchDictionaries {
  @Field(() => GraphQLJSON, { nullable: true })
  locations?: Record<string, LocationInfo>;

  @Field(() => GraphQLJSON, { nullable: true })
  aircraft?: Record<string, string>;

  @Field(() => GraphQLJSON, { nullable: true })
  currencies?: Record<string, string>;

  @Field(() => GraphQLJSON, { nullable: true })
  carriers?: Record<string, string>;
}

@ObjectType()
export class FlightSearchResponse {
  @Field(() => FlightSearchMeta, { nullable: true })
  meta?: FlightSearchMeta;

  @Field(() => [FlightOffer])
  data: FlightOffer[];

  @Field(() => FlightSearchDictionaries, { nullable: true })
  dictionaries?: FlightSearchDictionaries;
}

@ObjectType()
export class FlightDestination {
  @Field()
  type: string;

  @Field()
  origin: string;

  @Field()
  destination: string;

  @Field()
  departureDate: string;

  @Field({ nullable: true })
  returnDate?: string;

  @Field(() => Price)
  price: Price;

  @Field(() => GraphQLJSON)
  links: any;
}

@ObjectType()
export class FlightInspirationResponse {
  @Field(() => [FlightDestination])
  data: FlightDestination[];

  @Field(() => FlightSearchDictionaries, { nullable: true })
  dictionaries?: FlightSearchDictionaries;
}