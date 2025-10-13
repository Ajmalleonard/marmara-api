import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';
import { FlightSearchResponse, FlightInspirationResponse } from './types/flight.types';
import { FlightSearchInput, FlightInspirationInput } from './dto/flight-search.input';
import { FlightSearchDto, FlightInspirationDto } from './dto/flight-search.dto';
import { 
  FlightBookingResponse, 
  FlightBooking, 
  BookingCancellationResponse 
} from './types/flight-booking.types';
import { 
  CreateFlightBookingInput, 
  ModifyFlightBookingInput, 
  CancelFlightBookingInput,
  GetBookingInput,
  GetUserBookingsInput
} from './dto/flight-booking.input';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Resolver()
export class AmadeusResolver {
  constructor(private readonly amadeusService: AmadeusService) {}

  @Query(() => String)
  async amadeusHealth(): Promise<string> {
    return 'ok';
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private convertPrismaToGraphQLBooking(prismaBooking: any): FlightBooking {
    return {
      id: prismaBooking.id,
      bookingReference: prismaBooking.bookingReference,
      amadeusBookingId: prismaBooking.amadeusBookingId,
      amadeusOfferId: prismaBooking.amadeusOfferId,
      userId: prismaBooking.userId,
      status: prismaBooking.status,
      bookingType: prismaBooking.bookingType,
      totalPrice: prismaBooking.totalPrice,
      baseFare: prismaBooking.baseFare,
      taxes: prismaBooking.taxes,
      fees: prismaBooking.fees,
      currency: prismaBooking.currency,
      passengers: prismaBooking.passengers?.map((passenger: any) => ({
        id: passenger.id,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        middleName: passenger.middleName,
        dateOfBirth: passenger.dateOfBirth.toISOString(),
        gender: passenger.gender,
        documentType: passenger.documentType,
        documentNumber: passenger.documentNumber,
        documentExpiry: passenger.documentExpiry?.toISOString(),
        issuingCountry: passenger.issuingCountry,
        nationality: passenger.nationality,
        email: passenger.email,
        phone: passenger.phone,
        isLeadPassenger: passenger.isLeadPassenger,
        specialRequests: passenger.specialRequests || [],
        emergencyContact: passenger.emergencyContact,
      })) || [],
      contactInfo: prismaBooking.contactInfo,
      outboundFlights: prismaBooking.outboundFlights?.map((flight: any) => ({
        id: flight.id,
        airline: flight.airline,
        airlineName: flight.airlineName,
        flightNumber: flight.flightNumber,
        operatingAirline: flight.operatingAirline,
        aircraft: flight.aircraft,
        aircraftName: flight.aircraftName,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureTerminal: flight.departureTerminal,
        arrivalTerminal: flight.arrivalTerminal,
        departureTime: flight.departureTime.toISOString(),
        arrivalTime: flight.arrivalTime.toISOString(),
        duration: flight.duration,
        bookingClass: flight.bookingClass,
        cabin: flight.cabin,
        fareBasis: flight.fareBasis,
        segmentNumber: flight.segmentNumber,
        isLayover: flight.isLayover,
        amadeusSegmentId: flight.amadeusSegmentId,
        amadeusData: flight.amadeusData,
      })) || [],
      returnFlights: prismaBooking.returnFlights?.map((flight: any) => ({
        id: flight.id,
        airline: flight.airline,
        airlineName: flight.airlineName,
        flightNumber: flight.flightNumber,
        operatingAirline: flight.operatingAirline,
        aircraft: flight.aircraft,
        aircraftName: flight.aircraftName,
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureTerminal: flight.departureTerminal,
        arrivalTerminal: flight.arrivalTerminal,
        departureTime: flight.departureTime.toISOString(),
        arrivalTime: flight.arrivalTime.toISOString(),
        duration: flight.duration,
        bookingClass: flight.bookingClass,
        cabin: flight.cabin,
        fareBasis: flight.fareBasis,
        segmentNumber: flight.segmentNumber,
        isLayover: flight.isLayover,
        amadeusSegmentId: flight.amadeusSegmentId,
        amadeusData: flight.amadeusData,
      })) || [],
      paymentStatus: prismaBooking.paymentStatus,
      paymentMethod: prismaBooking.paymentMethod,
      paymentTransactionId: prismaBooking.paymentTransactionId,
      paymentDate: prismaBooking.paymentDate?.toISOString(),
      searchCriteria: prismaBooking.searchCriteria,
      selectedOfferData: prismaBooking.selectedOfferData,
      bookingDate: prismaBooking.createdAt.toISOString(),
      travelDate: prismaBooking.travelDate.toISOString(),
      expiresAt: prismaBooking.expiresAt?.toISOString(),
      createdAt: prismaBooking.createdAt.toISOString(),
      updatedAt: prismaBooking.updatedAt.toISOString(),
    };
  }

  @Query(() => FlightSearchResponse)
  async searchFlights(
    @Args('input') input: FlightSearchInput,
  ): Promise<FlightSearchResponse> {
    // Convert GraphQL input to service DTO
    const searchDto: FlightSearchDto = {
      originLocationCode: input.originLocationCode,
      destinationLocationCode: input.destinationLocationCode,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      travelClass: input.travelClass,
      currencyCode: input.currencyCode,
      max: input.max,
      nonStop: input.nonStop,
    };

    const result = await this.amadeusService.searchFlights(searchDto);
    
    // Convert service response to GraphQL types
    return this.convertFlightSearchResponse(result);
  }

  @Query(() => FlightInspirationResponse)
  async flightInspiration(
    @Args('input') input: FlightInspirationInput,
  ): Promise<FlightInspirationResponse> {
    // Convert GraphQL input to service DTO
    const inspirationDto: FlightInspirationDto = {
      origin: input.origin,
      departureDate: input.departureDate,
      maxPrice: input.maxPrice,
    };

    const result = await this.amadeusService.searchFlightInspiration(inspirationDto);
    
    // Convert service response to GraphQL types
    return this.convertFlightInspirationResponse(result);
  }

  // ============================================
  // FLIGHT BOOKING MUTATIONS
  // ============================================

  @Mutation(() => FlightBookingResponse)
  @UseGuards(JwtAuthGuard)
  async createFlightBooking(
    @Args('input') input: CreateFlightBookingInput,
    @Context() context: any,
  ): Promise<FlightBookingResponse> {
    const userId = context.req.user.id;
    
    // Convert GraphQL input to service DTO
    const bookingDto = {
      flightOffer: input.flightOffer,
      travelers: input.passengers.map(passenger => ({
        id: Math.random().toString(36).substr(2, 9),
        dateOfBirth: passenger.dateOfBirth,
        name: {
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          middleName: passenger.middleName,
        },
        gender: passenger.gender,
        contact: {
          emailAddress: passenger.email || input.contactInfo.email,
          phones: passenger.phone ? [{
            deviceType: 'MOBILE',
            countryCallingCode: input.contactInfo.countryCode,
            number: passenger.phone,
          }] : undefined,
        },
        documents: [{
          documentType: passenger.documentType,
          number: passenger.documentNumber,
          expiryDate: passenger.documentExpiry,
          issuanceCountry: passenger.issuingCountry,
          nationality: passenger.nationality,
        }],
      })),
      contacts: [{
        addresseeName: {
          firstName: input.passengers.find(p => p.isLeadPassenger)?.firstName || input.passengers[0].firstName,
          lastName: input.passengers.find(p => p.isLeadPassenger)?.lastName || input.passengers[0].lastName,
        },
        emailAddress: input.contactInfo.email,
        phones: [{
          deviceType: 'MOBILE',
          countryCallingCode: input.contactInfo.countryCode,
          number: input.contactInfo.phone,
        }],
      }],
      remarks: input.remarks,
    };

    const result = await this.amadeusService.createFlightBooking(bookingDto, userId);
    
    // Get the created booking from database
    const createdBooking = await this.amadeusService.getFlightBooking(result.data.id, userId);
    
    // Convert to GraphQL response
    return {
      booking: this.convertPrismaToGraphQLBooking(createdBooking),
      message: 'Flight booking created successfully',
      success: true,
    };
  }

  @Mutation(() => BookingCancellationResponse)
  @UseGuards(JwtAuthGuard)
  async cancelFlightBooking(
    @Args('input') input: CancelFlightBookingInput,
    @Context() context: any,
  ): Promise<BookingCancellationResponse> {
    const userId = context.req.user.id;
    
    try {
      const result = await this.amadeusService.cancelFlightBooking(
        input.bookingId, 
        userId, 
        input.cancellationReason
      );
      
      return {
        success: true,
        message: 'Flight booking cancelled successfully',
        refundAmount: result.refund?.amount,
        refundCurrency: result.refund?.currency,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to cancel flight booking',
      };
    }
  }

  @Mutation(() => FlightBookingResponse)
  @UseGuards(JwtAuthGuard)
  async modifyFlightBooking(
    @Args('input') input: ModifyFlightBookingInput,
    @Context() context: any,
  ): Promise<FlightBookingResponse> {
    const userId = context.req.user.id;
    
    try {
      const updatedBooking = await this.amadeusService.modifyFlightBooking(
        input.bookingId,
        userId,
        {
          passengers: input.passengers,
          contactInfo: input.contactInfo,
          remarks: input.remarks,
        }
      );
      
      return {
        booking: this.convertPrismaToGraphQLBooking(updatedBooking),
        message: 'Flight booking modified successfully',
        success: true,
      };
    } catch (error) {
      return {
        booking: null as any,
        message: error.message || 'Failed to modify flight booking',
        success: false,
      };
    }
  }

  // ============================================
  // FLIGHT BOOKING QUERIES
  // ============================================

  @Query(() => FlightBooking)
  @UseGuards(JwtAuthGuard)
  async getFlightBooking(
    @Args('input') input: GetBookingInput,
    @Context() context: any,
  ): Promise<FlightBooking> {
    const userId = context.req.user.id;
    const booking = await this.amadeusService.getFlightBooking(input.bookingId, userId);
    return this.convertPrismaToGraphQLBooking(booking);
  }

  @Query(() => [FlightBooking])
  @UseGuards(JwtAuthGuard)
  async getUserFlightBookings(
    @Args('input', { nullable: true }) input?: GetUserBookingsInput,
    @Context() context?: any,
  ): Promise<FlightBooking[]> {
    const userId = context.req.user.id;
    const bookings = await this.amadeusService.getUserFlightBookings(userId);
    
    return bookings.map(booking => this.convertPrismaToGraphQLBooking(booking));
  }

  private convertFlightSearchResponse(serviceResponse: any): FlightSearchResponse {
    return {
      meta: serviceResponse.meta,
      data: serviceResponse.data?.map((offer: any) => ({
        ...offer,
        price: {
          ...offer.price,
          total: parseFloat(offer.price.total),
          base: parseFloat(offer.price.base),
          grandTotal: parseFloat(offer.price.grandTotal),
          fees: offer.price.fees?.map((fee: any) => ({
            ...fee,
            amount: parseFloat(fee.amount),
          })) || [],
        },
        travelerPricings: offer.travelerPricings?.map((tp: any) => ({
          ...tp,
          price: {
            ...tp.price,
            total: parseFloat(tp.price.total),
            base: parseFloat(tp.price.base),
            grandTotal: parseFloat(tp.price.grandTotal),
            fees: tp.price.fees?.map((fee: any) => ({
              ...fee,
              amount: parseFloat(fee.amount),
            })) || [],
          },
        })) || [],
      })) || [],
      dictionaries: serviceResponse.dictionaries,
    };
  }

  private convertFlightInspirationResponse(serviceResponse: any): FlightInspirationResponse {
    return {
      data: serviceResponse.data?.map((destination: any) => ({
        ...destination,
        price: {
          total: parseFloat(destination.price.total),
          base: parseFloat(destination.price.base || '0'),
          grandTotal: parseFloat(destination.price.grandTotal || destination.price.total),
          currency: destination.price.currency || 'EUR',
          fees: destination.price.fees || [],
        },
      })) || [],
      dictionaries: serviceResponse.dictionaries,
    };
  }
}