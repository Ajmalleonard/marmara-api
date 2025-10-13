// Amadeus API Authentication
export interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  state?: string;
}

// Flight Search Interfaces
export interface FlightSearchRequest {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  currencyCode?: string;
  max?: number;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  dictionaries?: {
    locations?: Record<string, LocationInfo>;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    carriers?: Record<string, string>;
  };
  meta?: {
    count: number;
    links?: {
      self?: string;
      next?: string;
      previous?: string;
      last?: string;
      first?: string;
    };
  };
}

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: Aircraft;
  operating?: Operating;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface Aircraft {
  code: string;
}

export interface Operating {
  carrierCode: string;
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees: Fee[];
  grandTotal: string;
}

export interface Fee {
  amount: string;
  type: string;
}

export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  class: string;
  includedCheckedBags: IncludedCheckedBags;
}

export interface IncludedCheckedBags {
  quantity: number;
}

export interface LocationInfo {
  cityCode: string;
  countryCode: string;
}

// Flight Booking Interfaces
export interface FlightBookingRequest {
  data: {
    type: 'flight-order';
    flightOffers: FlightOffer[];
    travelers: Traveler[];
    remarks?: {
      general?: GeneralRemark[];
    };
    ticketingAgreement?: {
      option: 'DELAY_TO_CANCEL' | 'CONFIRM';
      delay?: string;
    };
    contacts?: Contact[];
  };
}

export interface Traveler {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender: 'MALE' | 'FEMALE';
  contact?: {
    emailAddress?: string;
    phones?: Phone[];
  };
  documents?: Document[];
}

export interface Phone {
  deviceType: 'MOBILE' | 'LANDLINE';
  countryCallingCode: string;
  number: string;
}

export interface Document {
  documentType: 'PASSPORT' | 'IDENTITY_CARD';
  number: string;
  expiryDate: string;
  issuanceCountry: string;
  validityCountry: string;
  nationality: string;
  holder: boolean;
}

export interface Contact {
  addresseeName: {
    firstName: string;
    lastName: string;
  };
  companyName?: string;
  purpose: 'STANDARD' | 'INVOICE';
  phones: Phone[];
  emailAddress: string;
  address: {
    lines: string[];
    postalCode: string;
    cityName: string;
    countryCode: string;
  };
}

export interface GeneralRemark {
  subType: string;
  text: string;
}

export interface FlightBookingResponse {
  data: {
    type: 'flight-order';
    id: string;
    queuingOfficeId: string;
    associatedRecords: AssociatedRecord[];
    flightOffers: FlightOffer[];
    travelers: Traveler[];
    remarks?: {
      general?: GeneralRemark[];
    };
    ticketingAgreement?: {
      option: string;
      delay?: string;
    };
    contacts?: Contact[];
  };
  dictionaries?: {
    locations?: Record<string, LocationInfo>;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    carriers?: Record<string, string>;
  };
}

export interface AssociatedRecord {
  reference: string;
  creationDate: string;
  originSystemCode: string;
  flightOfferId: string;
}

// Flight Inspiration Search
export interface FlightInspirationRequest {
  origin: string;
  maxPrice?: number;
  departureDate?: string;
  oneWay?: boolean;
  duration?: string;
  nonStop?: boolean;
  viewBy?: 'COUNTRY' | 'CITY' | 'DESTINATION';
}

export interface FlightInspirationResponse {
  data: FlightDestination[];
  dictionaries?: {
    currencies?: Record<string, string>;
    locations?: Record<string, LocationInfo>;
  };
}

export interface FlightDestination {
  type: 'flight-destination';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: {
    total: string;
  };
  links: {
    flightDates: string;
    flightOffers: string;
  };
}

// Error Handling
export interface AmadeusError {
  error: string;
  error_description: string;
  code?: number;
  title?: string;
  detail?: string;
  status?: number;
  source?: {
    parameter?: string;
    pointer?: string;
  };
}

export interface AmadeusErrorResponse {
  errors: AmadeusError[];
}

// Airport & City Search Interfaces
export interface AirportCitySearchRequest {
  keyword: string;
  subType?: 'AIRPORT' | 'CITY';
  countryCode?: string;
  max?: number;
  include?: boolean;
}

export interface AirportCitySearchResponse {
  data: LocationData[];
  meta?: {
    count: number;
    links?: {
      self?: string;
    };
  };
}

export interface LocationData {
  type: 'location';
  subType: 'AIRPORT' | 'CITY';
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  timeZoneOffset?: string;
  iataCode: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    cityName?: string;
    cityCode?: string;
    countryName?: string;
    countryCode?: string;
    stateCode?: string;
    regionCode?: string;
  };
  analytics?: {
    travelers: {
      score: number;
    };
  };
}

// Airline Code Lookup Interfaces
export interface AirlineCodeLookupRequest {
  airlineCodes?: string;
  IATACode?: string;
  ICAOCode?: string;
}

export interface AirlineCodeLookupResponse {
  data: AirlineData[];
  meta?: {
    count: number;
    links?: {
      self?: string;
    };
  };
}

export interface AirlineData {
  type: 'airline';
  iataCode: string;
  icaoCode?: string;
  businessName: string;
  commonName?: string;
}