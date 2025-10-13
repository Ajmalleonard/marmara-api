import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateFlightBookingInput } from '../dto/flight-booking.input';

@Injectable()
export class FlightValidationService {
  /**
   * Validate flight offer data
   */
  validateFlightOffer(flightOffer: any): void {
    if (!flightOffer) {
      throw new BadRequestException('Flight offer is required');
    }

    // Validate required flight offer fields
    this.validateRequiredFields(flightOffer);
    
    // Validate flight offer structure
    this.validateFlightOfferStructure(flightOffer);
    
    // Validate pricing information
    this.validatePricing(flightOffer.price);
    
    // Validate itineraries
    this.validateItineraries(flightOffer.itineraries);
    
    // Validate traveler pricing
    this.validateTravelerPricing(flightOffer.travelerPricings);
  }

  /**
   * Validate required fields in flight offer
   */
  private validateRequiredFields(flightOffer: any): void {
    const requiredFields = ['id', 'source', 'itineraries', 'price', 'travelerPricings'];
    
    for (const field of requiredFields) {
      if (!flightOffer[field]) {
        throw new BadRequestException(`Flight offer missing required field: ${field}`);
      }
    }
  }

  /**
   * Validate flight offer structure
   */
  private validateFlightOfferStructure(flightOffer: any): void {
    // Validate offer ID format
    if (typeof flightOffer.id !== 'string' || flightOffer.id.length === 0) {
      throw new BadRequestException('Flight offer ID must be a non-empty string');
    }

    // Validate source
    if (typeof flightOffer.source !== 'string') {
      throw new BadRequestException('Flight offer source must be a string');
    }

    // Validate arrays
    if (!Array.isArray(flightOffer.itineraries)) {
      throw new BadRequestException('Flight offer itineraries must be an array');
    }

    if (!Array.isArray(flightOffer.travelerPricings)) {
      throw new BadRequestException('Flight offer traveler pricings must be an array');
    }
  }

  /**
   * Validate pricing information
   */
  private validatePricing(price: any): void {
    if (!price) {
      throw new BadRequestException('Flight offer price is required');
    }

    // Validate total price
    if (!price.total || isNaN(parseFloat(price.total))) {
      throw new BadRequestException('Flight offer total price must be a valid number');
    }

    const totalPrice = parseFloat(price.total);
    if (totalPrice <= 0) {
      throw new BadRequestException('Flight offer total price must be greater than 0');
    }

    if (totalPrice > 50000) {
      throw new BadRequestException('Flight offer total price seems unreasonably high');
    }

    // Validate currency
    if (!price.currency || typeof price.currency !== 'string' || price.currency.length !== 3) {
      throw new BadRequestException('Flight offer currency must be a valid 3-letter currency code');
    }

    // Validate base price if present
    if (price.base && isNaN(parseFloat(price.base))) {
      throw new BadRequestException('Flight offer base price must be a valid number');
    }
  }

  /**
   * Validate itineraries
   */
  private validateItineraries(itineraries: any[]): void {
    if (itineraries.length === 0) {
      throw new BadRequestException('Flight offer must have at least one itinerary');
    }

    if (itineraries.length > 2) {
      throw new BadRequestException('Flight offer cannot have more than 2 itineraries (outbound/return)');
    }

    itineraries.forEach((itinerary, index) => {
      this.validateItinerary(itinerary, index);
    });
  }

  /**
   * Validate individual itinerary
   */
  private validateItinerary(itinerary: any, index: number): void {
    const itineraryPrefix = `Itinerary ${index + 1}`;

    if (!itinerary.segments || !Array.isArray(itinerary.segments)) {
      throw new BadRequestException(`${itineraryPrefix} must have segments array`);
    }

    if (itinerary.segments.length === 0) {
      throw new BadRequestException(`${itineraryPrefix} must have at least one segment`);
    }

    if (itinerary.segments.length > 6) {
      throw new BadRequestException(`${itineraryPrefix} cannot have more than 6 segments`);
    }

    // Validate duration format
    if (itinerary.duration && !this.isValidDuration(itinerary.duration)) {
      throw new BadRequestException(`${itineraryPrefix} duration format is invalid`);
    }

    // Validate each segment
    itinerary.segments.forEach((segment: any, segmentIndex: number) => {
      this.validateSegment(segment, `${itineraryPrefix} Segment ${segmentIndex + 1}`);
    });

    // Validate segment connections
    this.validateSegmentConnections(itinerary.segments, itineraryPrefix);
  }

  /**
   * Validate flight segment
   */
  private validateSegment(segment: any, segmentPrefix: string): void {
    const requiredFields = ['departure', 'arrival', 'carrierCode', 'number', 'aircraft'];
    
    for (const field of requiredFields) {
      if (!segment[field]) {
        throw new BadRequestException(`${segmentPrefix} missing required field: ${field}`);
      }
    }

    // Validate departure and arrival
    this.validateEndpoint(segment.departure, `${segmentPrefix} departure`);
    this.validateEndpoint(segment.arrival, `${segmentPrefix} arrival`);

    // Validate carrier code
    if (!/^[A-Z0-9]{2,3}$/.test(segment.carrierCode)) {
      throw new BadRequestException(`${segmentPrefix} carrier code must be 2-3 uppercase alphanumeric characters`);
    }

    // Validate flight number
    if (!/^[A-Z0-9]{1,4}$/.test(segment.number)) {
      throw new BadRequestException(`${segmentPrefix} flight number format is invalid`);
    }

    // Validate aircraft code
    if (!segment.aircraft.code || !/^[A-Z0-9]{3}$/.test(segment.aircraft.code)) {
      throw new BadRequestException(`${segmentPrefix} aircraft code must be 3 alphanumeric characters`);
    }

    // Validate duration if present
    if (segment.duration && !this.isValidDuration(segment.duration)) {
      throw new BadRequestException(`${segmentPrefix} duration format is invalid`);
    }
  }

  /**
   * Validate flight endpoint (departure/arrival)
   */
  private validateEndpoint(endpoint: any, endpointName: string): void {
    if (!endpoint.iataCode || !/^[A-Z]{3}$/.test(endpoint.iataCode)) {
      throw new BadRequestException(`${endpointName} IATA code must be 3 uppercase letters`);
    }

    if (!endpoint.at) {
      throw new BadRequestException(`${endpointName} datetime is required`);
    }

    const dateTime = new Date(endpoint.at);
    if (isNaN(dateTime.getTime())) {
      throw new BadRequestException(`${endpointName} datetime format is invalid`);
    }

    // Validate that departure/arrival is not too far in the past or future
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    if (dateTime < oneYearAgo) {
      throw new BadRequestException(`${endpointName} datetime cannot be more than 1 year in the past`);
    }

    if (dateTime > twoYearsFromNow) {
      throw new BadRequestException(`${endpointName} datetime cannot be more than 2 years in the future`);
    }
  }

  /**
   * Validate segment connections (arrival of one segment should connect to departure of next)
   */
  private validateSegmentConnections(segments: any[], itineraryPrefix: string): void {
    for (let i = 0; i < segments.length - 1; i++) {
      const currentSegment = segments[i];
      const nextSegment = segments[i + 1];

      const arrivalTime = new Date(currentSegment.arrival.at);
      const departureTime = new Date(nextSegment.departure.at);

      // Check minimum connection time (30 minutes)
      const connectionTime = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60);
      if (connectionTime < 30) {
        throw new BadRequestException(
          `${itineraryPrefix} connection time between segments ${i + 1} and ${i + 2} is too short (minimum 30 minutes)`
        );
      }

      // Check maximum connection time (24 hours)
      if (connectionTime > 24 * 60) {
        throw new BadRequestException(
          `${itineraryPrefix} connection time between segments ${i + 1} and ${i + 2} is too long (maximum 24 hours)`
        );
      }

      // For connecting flights, arrival and departure airports should be the same
      if (currentSegment.arrival.iataCode !== nextSegment.departure.iataCode) {
        throw new BadRequestException(
          `${itineraryPrefix} segments ${i + 1} and ${i + 2} do not connect at the same airport`
        );
      }
    }
  }

  /**
   * Validate traveler pricing
   */
  private validateTravelerPricing(travelerPricings: any[]): void {
    if (travelerPricings.length === 0) {
      throw new BadRequestException('Flight offer must have traveler pricing information');
    }

    travelerPricings.forEach((pricing, index) => {
      this.validateIndividualTravelerPricing(pricing, index);
    });
  }

  /**
   * Validate individual traveler pricing
   */
  private validateIndividualTravelerPricing(pricing: any, index: number): void {
    const pricingPrefix = `Traveler pricing ${index + 1}`;

    if (!pricing.travelerId) {
      throw new BadRequestException(`${pricingPrefix} must have traveler ID`);
    }

    if (!pricing.fareOption) {
      throw new BadRequestException(`${pricingPrefix} must have fare option`);
    }

    if (!pricing.travelerType || !['ADULT', 'CHILD', 'INFANT'].includes(pricing.travelerType)) {
      throw new BadRequestException(`${pricingPrefix} traveler type must be ADULT, CHILD, or INFANT`);
    }

    if (!pricing.price || !pricing.price.total || isNaN(parseFloat(pricing.price.total))) {
      throw new BadRequestException(`${pricingPrefix} must have valid price total`);
    }

    if (!pricing.fareDetailsBySegment || !Array.isArray(pricing.fareDetailsBySegment)) {
      throw new BadRequestException(`${pricingPrefix} must have fare details by segment`);
    }
  }

  /**
   * Validate booking constraints
   */
  validateBookingConstraints(bookingInput: CreateFlightBookingInput): void {
    // Validate passenger count matches traveler pricing
    const flightOffer = bookingInput.flightOffer;
    const passengerCount = bookingInput.passengers.length;
    const travelerPricingCount = flightOffer.travelerPricings?.length || 0;

    if (passengerCount !== travelerPricingCount) {
      throw new BadRequestException(
        `Number of passengers (${passengerCount}) must match traveler pricing count (${travelerPricingCount})`
      );
    }

    // Validate booking is not too close to departure
    const firstDeparture = new Date(flightOffer.itineraries[0].segments[0].departure.at);
    const now = new Date();
    const hoursUntilDeparture = (firstDeparture.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 2) {
      throw new BadRequestException('Cannot book flights departing within 2 hours');
    }

    // Validate instant ticketing requirement
    if (flightOffer.instantTicketingRequired && hoursUntilDeparture < 24) {
      throw new BadRequestException('This flight requires instant ticketing and cannot be booked within 24 hours of departure');
    }

    // Validate number of bookable seats
    if (flightOffer.numberOfBookableSeats && passengerCount > flightOffer.numberOfBookableSeats) {
      throw new BadRequestException(
        `Only ${flightOffer.numberOfBookableSeats} seats available, but ${passengerCount} passengers requested`
      );
    }
  }

  /**
   * Validate duration format (ISO 8601 duration)
   */
  private isValidDuration(duration: string): boolean {
    // Basic ISO 8601 duration format validation (PT1H30M)
    const durationRegex = /^PT(?:(\d+)H)?(?:(\d+)M)?$/;
    return durationRegex.test(duration);
  }

  /**
   * Validate travel dates are reasonable
   */
  validateTravelDates(flightOffer: any): void {
    const now = new Date();
    const maxAdvanceBooking = new Date();
    maxAdvanceBooking.setFullYear(maxAdvanceBooking.getFullYear() + 1);

    // Check all departure dates
    flightOffer.itineraries.forEach((itinerary: any, index: number) => {
      const departureDate = new Date(itinerary.segments[0].departure.at);
      
      if (departureDate < now) {
        throw new BadRequestException(`Itinerary ${index + 1} departure date is in the past`);
      }

      if (departureDate > maxAdvanceBooking) {
        throw new BadRequestException(`Itinerary ${index + 1} departure date is more than 1 year in advance`);
      }
    });

    // For round trips, validate return is after outbound
    if (flightOffer.itineraries.length === 2) {
      const outboundDeparture = new Date(flightOffer.itineraries[0].segments[0].departure.at);
      const returnDeparture = new Date(flightOffer.itineraries[1].segments[0].departure.at);

      if (returnDeparture <= outboundDeparture) {
        throw new BadRequestException('Return departure must be after outbound departure');
      }
    }
  }
}