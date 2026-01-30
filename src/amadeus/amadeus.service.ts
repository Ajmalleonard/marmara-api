import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import {
  AmadeusTokenResponse,
  FlightSearchRequest,
  FlightSearchResponse,
  FlightInspirationRequest,
  FlightInspirationResponse,
  FlightBookingRequest,
  FlightBookingResponse,
  AmadeusErrorResponse,
  AirportCitySearchRequest,
  AirportCitySearchResponse,
  AirlineCodeLookupRequest,
  AirlineCodeLookupResponse,
} from './interfaces/amadeus.interface';
import { FlightSearchDto, FlightInspirationDto, FlightBookingDto, AirportCitySearchDto, AirlineCodeLookupDto } from './dto/flight-search.dto';
import { PassengerValidationService } from './services/passenger-validation.service';
import { FlightValidationService } from './services/flight-validation.service';
import { PaymentService } from './payment.service';
import { sendFlightBookingConfirmationEmail, sendFlightBookingCancellationEmail } from '../emails/emails';

@Injectable()
export class AmadeusService {
  private readonly logger = new Logger(AmadeusService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private httpClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private passengerValidationService: PassengerValidationService,
    private flightValidationService: FlightValidationService,
    private paymentService: PaymentService,
  ) {
    // Use test environment for Self-Service APIs
    this.baseUrl = 'https://test.api.amadeus.com';
    this.clientId = this.configService.get<string>('AMADEUS_KEYS');
    this.clientSecret = this.configService.get<string>('AMADEUS_SECRET');

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Amadeus API credentials not found in environment variables',
      );
    }

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(
      async (config) => {
        await this.ensureValidToken();
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear it and retry once
          this.accessToken = null;
          this.tokenExpiresAt = null;

          if (!error.config._retry) {
            error.config._retry = true;
            await this.ensureValidToken();
            if (this.accessToken) {
              error.config.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return this.httpClient.request(error.config);
          }
        }
        return Promise.reject(this.handleAmadeusError(error));
      },
    );
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<void> {
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      new Date() < this.tokenExpiresAt
    ) {
      return; // Token is still valid
    }

    try {
      await this.authenticate();
    } catch (error) {
      this.logger.error('Failed to authenticate with Amadeus API', error);
      throw new HttpException(
        'Authentication failed with Amadeus API',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Authenticate with Amadeus API and get access token
   */
  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post<AmadeusTokenResponse>(
        `${this.baseUrl}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Set expiration 5 minutes before actual expiry for safety
      const expiresInMs = (response.data.expires_in - 300) * 1000;
      this.tokenExpiresAt = new Date(Date.now() + expiresInMs);

      this.logger.log('Successfully authenticated with Amadeus API');
    } catch (error) {
      this.logger.error(
        'Amadeus authentication failed',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Search for flight offers
   */
  async searchFlights(
    searchDto: FlightSearchDto,
  ): Promise<FlightSearchResponse> {
    try {
      const searchParams = this.buildFlightSearchParams(searchDto);

      // Check cache first
      const cacheKey = this.generateSearchCacheKey(searchParams);
      const cachedResult = await this.getCachedSearch(cacheKey);

      if (cachedResult) {
        this.logger.log('Returning cached flight search results');
        return cachedResult.searchResults as unknown as FlightSearchResponse;
      }

      const response = await this.httpClient.get<FlightSearchResponse>(
        '/v2/shopping/flight-offers',
        { params: searchParams },
      );

      // Cache the results
      await this.cacheSearchResults(cacheKey, searchParams, response.data);

      this.logger.log(`Found ${response.data.data?.length || 0} flight offers`);
      return response.data;
    } catch (error) {
      this.logger.error('Flight search failed', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Search for flight inspiration (destinations)
   */
  async searchFlightInspiration(
    searchDto: FlightInspirationDto,
  ): Promise<FlightInspirationResponse> {
    try {
      const params = {
        origin: searchDto.origin,
        ...(searchDto.maxPrice && { maxPrice: searchDto.maxPrice }),
        ...(searchDto.departureDate && {
          departureDate: searchDto.departureDate,
        }),
        ...(searchDto.oneWay !== undefined && { oneWay: searchDto.oneWay }),
        ...(searchDto.duration && { duration: searchDto.duration }),
        ...(searchDto.nonStop !== undefined && { nonStop: searchDto.nonStop }),
        ...(searchDto.viewBy && { viewBy: searchDto.viewBy }),
      };

      const response = await this.httpClient.get<FlightInspirationResponse>(
        '/v1/shopping/flight-destinations',
        { params },
      );

      this.logger.log(
        `Found ${response.data.data?.length || 0} flight destinations`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Flight inspiration search failed', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Search for airports and cities by keyword
   */
  async searchAirportsAndCities(
    searchDto: AirportCitySearchDto,
  ): Promise<AirportCitySearchResponse> {
    try {
      const params: AirportCitySearchRequest = {
        keyword: searchDto.keyword,
        ...(searchDto.subType && { subType: searchDto.subType }),
        ...(searchDto.countryCode && { countryCode: searchDto.countryCode }),
        ...(searchDto.max && { max: searchDto.max }),
        ...(searchDto.include !== undefined && { include: searchDto.include }),
      };

      const response = await this.httpClient.get<AirportCitySearchResponse>(
        '/v1/reference-data/locations',
        { params },
      );

      this.logger.log(
        `Found ${response.data.data?.length || 0} locations for keyword: ${searchDto.keyword}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Airport/City search failed', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Lookup airline information by IATA or ICAO codes
   */
  async lookupAirlineCodes(
    searchDto: AirlineCodeLookupDto,
  ): Promise<AirlineCodeLookupResponse> {
    try {
      const params: AirlineCodeLookupRequest = {
        ...(searchDto.airlineCodes && { airlineCodes: searchDto.airlineCodes }),
        ...(searchDto.IATACode && { IATACode: searchDto.IATACode }),
        ...(searchDto.ICAOCode && { ICAOCode: searchDto.ICAOCode }),
      };

      const response = await this.httpClient.get<AirlineCodeLookupResponse>(
        '/v1/reference-data/airlines',
        { params },
      );

      this.logger.log(`Found ${response.data.data?.length || 0} airlines`);
      return response.data;
    } catch (error) {
      this.logger.error('Airline code lookup failed', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Create a flight booking
   */
  async createFlightBooking(
    bookingDto: FlightBookingDto,
    userId?: string,
  ): Promise<FlightBookingResponse> {
    try {
      // Validate flight offer structure and constraints
      this.flightValidationService.validateFlightOffer(bookingDto.flightOffer);
      this.flightValidationService.validateTravelDates(bookingDto.flightOffer);

      // Validate passengers
      this.passengerValidationService.validatePassengers(bookingDto.travelers);

      // Validate booking constraints (passenger count, timing, etc.)
      const bookingInput = {
        flightOffer: bookingDto.flightOffer,
        passengers: bookingDto.travelers,
        contactInfo: bookingDto.contacts?.[0] || { email: '', phone: '' },
      };
      this.flightValidationService.validateBookingConstraints(bookingInput);

      // Handle Guest User: If userId is missing, find or create user based on contact email
      if (!userId) {
        const contactEmail = bookingDto.contacts?.[0]?.emailAddress;
        if (!contactEmail) {
          throw new HttpException(
            'Contact email is required for guest booking',
            HttpStatus.BAD_REQUEST,
          );
        }

        let user = await this.prisma.user.findUnique({
          where: { email: contactEmail },
        });

        if (!user) {
          // Create a new guest user
          const randomPassword = crypto.randomBytes(12).toString('hex');
          // Extract name from first traveler if possible, or use email part
          const firstName = bookingDto.travelers[0]?.name?.firstName || 'Guest';
          const lastName = bookingDto.travelers[0]?.name?.lastName || 'User';

          user = await this.prisma.user.create({
            data: {
              email: contactEmail,
              password: randomPassword, // In a real app, we should hash this, but for now/guest it's placeholder
              name: `${firstName} ${lastName}`,
              isVerified: false,
              isAdmin: false,
            },
          });
          this.logger.log(`Created guest user for email: ${contactEmail}`);
        }

        userId = user.id;
      }

      // First, validate the flight offer by pricing it
      const pricingResponse = await this.priceFlightOffer(
        bookingDto.flightOffer,
      );

      if (!pricingResponse.data || pricingResponse.data.length === 0) {
        throw new HttpException(
          'Flight offer is no longer available',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Use the priced offer for booking
      const pricedOffer = pricingResponse.data[0];

      // Sanitize and map travelers for Amadeus API
      const amadeusTravelers = bookingDto.travelers.map((t) => {
        const traveler: any = {
          id: t.id,
          dateOfBirth: t.dateOfBirth,
          name: t.name,
          gender: t.gender,
          contact: t.contact,
        };

        // Reconstruct documents if flattened fields exist
        if (t.documentNumber) {
          traveler.documents = [
            {
              documentType:
                t.documentType === 'ID_CARD' ? 'IDENTITY_CARD' : t.documentType,
              number: t.documentNumber,
              expiryDate: t.documentExpiry,
              issuanceCountry: t.issuingCountry,
              nationality: t.nationality,
              holder: true,
            },
          ];
        } else if (t.documents) {
          traveler.documents = t.documents;
        }

        return traveler;
      });

      const bookingRequest: FlightBookingRequest = {
        data: {
          type: 'flight-order',
          flightOffers: [pricedOffer],
          travelers: amadeusTravelers,
          ...(bookingDto.remarks && { remarks: bookingDto.remarks }),
          ...(bookingDto.contacts && { contacts: bookingDto.contacts }),
        },
      };

      const response = await this.httpClient.post<FlightBookingResponse>(
        '/v1/booking/flight-orders',
        bookingRequest,
      );

      // Save booking to database
      const savedBooking = await this.saveFlightBookingToDatabase(
        response.data,
        userId,
        bookingDto,
      );

      // Send booking confirmation email
      try {
        const customerEmail =
          bookingDto.contacts?.[0]?.emailAddress ||
          savedBooking.contactInfo?.email;
        if (customerEmail && savedBooking.outboundFlights?.[0]) {
          const outboundFlight = savedBooking.outboundFlights[0];
          const passengerNames = savedBooking.passengers
            .map((p) => `${p.firstName} ${p.lastName}`)
            .join(', ');

          await sendFlightBookingConfirmationEmail(customerEmail, {
            customerName:
              savedBooking.passengers[0]?.firstName +
              ' ' +
              savedBooking.passengers[0]?.lastName,
            bookingReference: savedBooking.bookingReference,
            totalAmount: `${savedBooking.totalPrice} ${savedBooking.currency}`,
            paymentStatus: savedBooking.paymentStatus,
            departureCity: outboundFlight.departureAirport,
            departureCode: outboundFlight.departureAirport,
            arrivalCity: outboundFlight.arrivalAirport,
            arrivalCode: outboundFlight.arrivalAirport,
            departureDate: outboundFlight.departureTime.toDateString(),
            departureTime: outboundFlight.departureTime.toTimeString(),
            arrivalDate: outboundFlight.arrivalTime.toDateString(),
            arrivalTime: outboundFlight.arrivalTime.toTimeString(),
            flightNumber: outboundFlight.flightNumber,
            airline: outboundFlight.airlineName,
            passengerDetails: passengerNames,
            bookingId: savedBooking.id,
            customerEmail: customerEmail,
          });
          this.logger.log(
            `Booking confirmation email sent to ${customerEmail}`,
          );
        }
      } catch (emailError) {
        this.logger.error(
          'Failed to send booking confirmation email',
          emailError,
        );
        // Don't throw error - booking was successful even if email failed
      }

      this.logger.log(
        `Flight booking created successfully: ${response.data.data.id}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Flight booking creation failed', error);
      if (error instanceof Error) {
        this.logger.error('Error stack:', error.stack);
        this.logger.error(
          'Error details:',
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        );
      }
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Price a flight offer to get the latest pricing
   */
  private async priceFlightOffer(flightOffer: any): Promise<{ data: any[] }> {
    try {
      const response = await this.httpClient.post(
        '/v1/shopping/flight-offers/pricing',
        {
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer],
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Flight offer pricing failed', error);
      if (error instanceof Error) {
        this.logger.error('Error stack:', error.stack);
        this.logger.error(
          'Error details:',
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        );
      }
      throw error;
    }
  }

  /**
   * Build flight search parameters
   */
  private buildFlightSearchParams(
    searchDto: FlightSearchDto,
  ): FlightSearchRequest {
    return {
      originLocationCode: searchDto.originLocationCode,
      destinationLocationCode: searchDto.destinationLocationCode,
      departureDate: searchDto.departureDate,
      ...(searchDto.returnDate && { returnDate: searchDto.returnDate }),
      adults: searchDto.adults,
      ...(searchDto.children && { children: searchDto.children }),
      ...(searchDto.infants && { infants: searchDto.infants }),
      ...(searchDto.travelClass && { travelClass: searchDto.travelClass }),
      ...(searchDto.nonStop !== undefined && { nonStop: searchDto.nonStop }),
      ...(searchDto.currencyCode && { currencyCode: searchDto.currencyCode }),
      ...(searchDto.max && { max: searchDto.max }),
    };
  }

  /**
   * Generate cache key for search results
   */
  private generateSearchCacheKey(params: FlightSearchRequest): string {
    const searchString = JSON.stringify(params);
    return crypto.createHash('md5').update(searchString).digest('hex');
  }

  /**
   * Get cached search results
   */
  private async getCachedSearch(searchHash: string) {
    try {
      const cached = await this.prisma.flightSearchCache.findUnique({
        where: { searchHash },
      });

      if (cached && cached.expiresAt > new Date()) {
        // Update search count
        await this.prisma.flightSearchCache.update({
          where: { id: cached.id },
          data: { searchCount: { increment: 1 } },
        });
        return cached;
      }

      return null;
    } catch (error) {
      this.logger.warn('Failed to get cached search results', error);
      return null;
    }
  }

  /**
   * Cache search results
   */
  private async cacheSearchResults(
    searchHash: string,
    params: FlightSearchRequest,
    results: FlightSearchResponse,
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Cache for 15 minutes

      await this.prisma.flightSearchCache.upsert({
        where: { searchHash },
        create: {
          searchHash,
          origin: params.originLocationCode,
          destination: params.destinationLocationCode,
          departureDate: new Date(params.departureDate),
          returnDate: params.returnDate ? new Date(params.returnDate) : null,
          adults: params.adults,
          children: params.children || 0,
          infants: params.infants || 0,
          cabinClass: params.travelClass || 'ECONOMY',
          searchResults: results as any,
          resultCount: results.data?.length || 0,
          expiresAt,
        },
        update: {
          searchResults: results as any,
          resultCount: results.data?.length || 0,
          expiresAt,
          searchCount: { increment: 1 },
        },
      });
    } catch (error) {
      this.logger.warn('Failed to cache search results', error);
    }
  }

  /**
   * Save flight booking to database
   */
  private async saveFlightBookingToDatabase(
    amadeusBooking: FlightBookingResponse,
    userId: string,
    originalRequest: FlightBookingDto,
  ): Promise<any> {
    try {
      const booking = amadeusBooking.data;
      const flightOffer = booking.flightOffers[0];

      this.logger.log(`Saving booking ${booking.id} for user ${userId}`);

      // Generate internal booking reference
      const bookingReference = `MAR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Extract pricing information
      const totalPrice = parseFloat(flightOffer.price.total);
      const baseFare = parseFloat(flightOffer.price.base);
      const taxes =
        flightOffer.price.fees?.reduce(
          (sum, fee) => sum + parseFloat(fee.amount),
          0,
        ) || 0;

      // Determine booking type
      const bookingType =
        flightOffer.itineraries.length > 1 ? 'ROUND_TRIP' : 'ONE_WAY';

      // Get travel date (first departure)
      const travelDate = new Date(
        flightOffer.itineraries[0].segments[0].departure.at,
      );

      // Create flight booking
      const flightBooking = await this.prisma.flightBooking.create({
        data: {
          bookingReference,
          amadeusBookingId: booking.id,
          amadeusOfferId: flightOffer.id,
          userId,
          status: 'CONFIRMED',
          bookingType,
          totalPrice,
          baseFare,
          taxes,
          fees: 0,
          currency: flightOffer.price.currency,
          contactInfo: {
            email: booking.contacts?.[0]?.emailAddress || '',
            phone: booking.contacts?.[0]?.phones?.[0]?.number || '',
            countryCode:
              booking.contacts?.[0]?.phones?.[0]?.countryCallingCode || '',
          },
          paymentStatus: 'PENDING',
          searchCriteria: originalRequest as any,
          selectedOfferData: flightOffer as any,
          travelDate,
          passengers: {
            create: booking.travelers.map((traveler, index) => ({
              firstName: traveler.name.firstName,
              lastName: traveler.name.lastName,
              dateOfBirth: new Date(traveler.dateOfBirth),
              gender: traveler.gender,
              documentType: this.mapDocumentType(
                traveler.documents?.[0]?.documentType,
              ) as any,
              documentNumber: traveler.documents?.[0]?.number || '',
              documentExpiry: traveler.documents?.[0]?.expiryDate
                ? new Date(traveler.documents[0].expiryDate)
                : null,
              issuingCountry: traveler.documents?.[0]?.issuanceCountry || '',
              nationality: traveler.documents?.[0]?.nationality || '',
              email: traveler.contact?.emailAddress,
              phone: traveler.contact?.phones?.[0]?.number,
              isLeadPassenger: index === 0,
              specialRequests: [],
            })),
          },
          outboundFlights: {
            create: flightOffer.itineraries[0].segments.map(
              (segment, index) => ({
                airline: segment.carrierCode,
                airlineName:
                  amadeusBooking.dictionaries?.carriers?.[
                    segment.carrierCode
                  ] || segment.carrierCode,
                flightNumber: segment.number,
                operatingAirline: segment.operating?.carrierCode,
                aircraft: segment.aircraft.code,
                aircraftName:
                  amadeusBooking.dictionaries?.aircraft?.[
                    segment.aircraft.code
                  ],
                departureAirport: segment.departure.iataCode,
                arrivalAirport: segment.arrival.iataCode,
                departureTerminal: segment.departure.terminal,
                arrivalTerminal: segment.arrival.terminal,
                departureTime: new Date(segment.departure.at),
                arrivalTime: new Date(segment.arrival.at),
                duration: segment.duration,
                bookingClass:
                  flightOffer.travelerPricings[0].fareDetailsBySegment[index]
                    ?.class || 'Y',
                cabin: this.mapCabinClass(
                  flightOffer.travelerPricings[0].fareDetailsBySegment[index]
                    ?.cabin,
                ) as any,
                fareBasis:
                  flightOffer.travelerPricings[0].fareDetailsBySegment[index]
                    ?.fareBasis,
                segmentNumber: index + 1,
                isLayover: index > 0,
                amadeusSegmentId: segment.id,
                amadeusData: segment as any,
              }),
            ),
          },
          ...(flightOffer.itineraries.length > 1 && {
            returnFlights: {
              create: flightOffer.itineraries[1].segments.map(
                (segment, index) => ({
                  airline: segment.carrierCode,
                  airlineName:
                    amadeusBooking.dictionaries?.carriers?.[
                      segment.carrierCode
                    ] || segment.carrierCode,
                  flightNumber: segment.number,
                  operatingAirline: segment.operating?.carrierCode,
                  aircraft: segment.aircraft.code,
                  aircraftName:
                    amadeusBooking.dictionaries?.aircraft?.[
                      segment.aircraft.code
                    ],
                  departureAirport: segment.departure.iataCode,
                  arrivalAirport: segment.arrival.iataCode,
                  departureTerminal: segment.departure.terminal,
                  arrivalTerminal: segment.arrival.terminal,
                  departureTime: new Date(segment.departure.at),
                  arrivalTime: new Date(segment.arrival.at),
                  duration: segment.duration,
                  bookingClass:
                    flightOffer.travelerPricings[0].fareDetailsBySegment[
                      flightOffer.itineraries[0].segments.length + index
                    ]?.class || 'Y',
                  cabin: this.mapCabinClass(
                    flightOffer.travelerPricings[0].fareDetailsBySegment[
                      flightOffer.itineraries[0].segments.length + index
                    ]?.cabin,
                  ) as any,
                  fareBasis:
                    flightOffer.travelerPricings[0].fareDetailsBySegment[
                      flightOffer.itineraries[0].segments.length + index
                    ]?.fareBasis,
                  segmentNumber: index + 1,
                  isLayover: index > 0,
                  amadeusSegmentId: segment.id,
                  amadeusData: segment as any,
                }),
              ),
            },
          }),
        },
      });

      this.logger.log(`Flight booking saved to database: ${flightBooking.id}`);
      return flightBooking;
    } catch (error) {
      this.logger.error('Failed to save flight booking to database', error);
      if (error instanceof Error) {
        this.logger.error('Error stack:', error.stack);
        this.logger.error(
          'Error details:',
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        );
      }
      throw error;
    }
  }

  /**
   * Map Amadeus document type to Prisma DocumentType enum
   */
  private mapDocumentType(amadeusDocType: string): string {
    const docTypeMap: { [key: string]: string } = {
      PASSPORT: 'PASSPORT',
      IDENTITY_CARD: 'NATIONAL_ID',
      NATIONAL_ID: 'NATIONAL_ID',
      DRIVERS_LICENSE: 'DRIVERS_LICENSE',
      DRIVING_LICENSE: 'DRIVERS_LICENSE',
    };

    return docTypeMap[amadeusDocType?.toUpperCase()] || 'PASSPORT';
  }

  /**
   * Map Amadeus cabin class to Prisma CabinClass enum
   */
  private mapCabinClass(amadeusClass: string): string {
    const classMap: { [key: string]: string } = {
      ECONOMY: 'ECONOMY',
      PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
      BUSINESS: 'BUSINESS',
      FIRST: 'FIRST',
    };

    return classMap[amadeusClass?.toUpperCase()] || 'ECONOMY';
  }
  private handleAmadeusError(error: any): HttpException {
    if (error.response?.data) {
      const amadeusError = error.response.data as AmadeusErrorResponse;

      if (amadeusError.errors && amadeusError.errors.length > 0) {
        const firstError = amadeusError.errors[0];
        const message =
          firstError.detail || firstError.title || 'Amadeus API error';
        const status =
          firstError.status || error.response.status || HttpStatus.BAD_REQUEST;

        return new HttpException(message, status);
      }
    }

    if (error instanceof HttpException) {
      return error;
    }

    return new HttpException(
      'An error occurred while processing your request',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Get flight booking by ID
   */
  async getFlightBooking(bookingId: string, userId: string) {
    try {
      const booking = await this.prisma.flightBooking.findFirst({
        where: {
          id: bookingId,
          userId,
        },
        include: {
          passengers: true,
          outboundFlights: true,
          returnFlights: true,
        },
      });

      if (!booking) {
        throw new HttpException(
          'Flight booking not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return booking;
    } catch (error) {
      this.logger.error('Failed to get flight booking', error);
      throw error;
    }
  }

  /**
   * Get user's flight bookings
   */
  async getUserFlightBookings(userId: string) {
    try {
      const bookings = await this.prisma.flightBooking.findMany({
        where: { userId },
        include: {
          passengers: true,
          outboundFlights: true,
          returnFlights: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return bookings;
    } catch (error) {
      this.logger.error('Failed to get user flight bookings', error);
      throw error;
    }
  }

  /**
   * Cancel a flight booking
   */
  async cancelFlightBooking(
    bookingId: string,
    userId: string,
    cancellationReason?: string,
  ) {
    try {
      // Get the booking first
      const booking = await this.getFlightBooking(bookingId, userId);

      if (!booking) {
        throw new HttpException(
          'Flight booking not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if booking can be cancelled
      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        throw new HttpException(
          'Booking is already cancelled or refunded',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (booking.status === 'COMPLETED') {
        throw new HttpException(
          'Cannot cancel a completed flight',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check cancellation policy (24 hours before departure)
      const departureTime = booking.outboundFlights?.[0]?.departureTime;
      if (departureTime) {
        const hoursUntilDeparture =
          (new Date(departureTime).getTime() - new Date().getTime()) /
          (1000 * 60 * 60);
        if (hoursUntilDeparture < 24) {
          this.logger.warn(
            `Cancellation attempted within 24 hours of departure for booking ${bookingId}`,
          );
          // Still allow cancellation but may affect refund amount
        }
      }

      // Try to cancel with Amadeus API if booking is confirmed
      let amadeusSuccess = false;
      if (booking.status === 'CONFIRMED' || booking.status === 'TICKETED') {
        try {
          // Note: Amadeus doesn't have a direct cancellation API for flight orders
          // In a real implementation, you would need to contact the airline directly
          // For now, we'll simulate the cancellation
          this.logger.log(
            `Attempting to cancel Amadeus booking: ${booking.amadeusBookingId}`,
          );
          amadeusSuccess = true;
        } catch (amadeusError) {
          this.logger.error(
            'Amadeus cancellation failed, proceeding with local cancellation',
            amadeusError,
          );
          // Continue with local cancellation even if Amadeus fails
        }
      }

      // Update booking status in database
      const updatedBooking = await this.prisma.flightBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason,
          cancelledAt: new Date(),
        },
        include: {
          passengers: true,
          outboundFlights: true,
          returnFlights: true,
          payments: true,
        },
      });

      // Process refund if payment was made
      let refundResult = null;
      if (updatedBooking.payments && updatedBooking.payments.length > 0) {
        const successfulPayments = updatedBooking.payments.filter(
          (p) => p.status === 'COMPLETED',
        );

        for (const payment of successfulPayments) {
          try {
            // Calculate refund amount based on cancellation policy
            const refundAmount = this.calculateRefundAmount(
              booking,
              departureTime,
            );

            refundResult = await this.paymentService.refundPayment({
              paymentId: payment.id,
              amount: refundAmount,
              reason:
                cancellationReason || 'Flight booking cancelled by customer',
            });

            this.logger.log(
              `Refund processed for payment ${payment.id}: ${refundResult.refundId}`,
            );
          } catch (refundError) {
            this.logger.error(
              `Failed to process refund for payment ${payment.id}`,
              refundError,
            );
            // Continue with other payments
          }
        }
      }

      // Send cancellation email notification
      try {
        const customerEmail = updatedBooking.contactInfo?.email;
        if (customerEmail && updatedBooking.outboundFlights?.[0]) {
          const outboundFlight = updatedBooking.outboundFlights[0];

          await sendFlightBookingCancellationEmail(customerEmail, {
            customerName:
              updatedBooking.passengers[0]?.firstName +
              ' ' +
              updatedBooking.passengers[0]?.lastName,
            bookingReference: updatedBooking.bookingReference,
            cancellationDate: new Date().toDateString(),
            cancellationReason: cancellationReason || 'Customer request',
            refundStatus: refundResult ? 'Processed' : 'Pending',
            refundAmount: refundResult
              ? `${refundResult.amount} ${updatedBooking.currency}`
              : undefined,
            departureCity: outboundFlight.departureAirport,
            departureCode: outboundFlight.departureAirport,
            arrivalCity: outboundFlight.arrivalAirport,
            arrivalCode: outboundFlight.arrivalAirport,
            departureDate: outboundFlight.departureTime.toDateString(),
            departureTime: outboundFlight.departureTime.toTimeString(),
            flightNumber: outboundFlight.flightNumber,
            airline: outboundFlight.airlineName,
            customerEmail: customerEmail,
          });
          this.logger.log(`Cancellation email sent to ${customerEmail}`);
        }
      } catch (emailError) {
        this.logger.error('Failed to send cancellation email', emailError);
        // Don't throw error - cancellation was successful even if email failed
      }

      this.logger.log(`Flight booking cancelled successfully: ${bookingId}`);

      return {
        booking: updatedBooking,
        refund: refundResult,
        amadeusSuccess,
      };
    } catch (error) {
      this.logger.error('Flight booking cancellation failed', error);
      throw error;
    }
  }

  /**
   * Modify a flight booking
   */
  async modifyFlightBooking(
    bookingId: string,
    userId: string,
    modifications: any,
  ) {
    try {
      // Get the booking first
      const booking = await this.getFlightBooking(bookingId, userId);

      if (!booking) {
        throw new HttpException(
          'Flight booking not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if booking can be modified
      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        throw new HttpException(
          'Cannot modify a cancelled or refunded booking',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (booking.status === 'COMPLETED') {
        throw new HttpException(
          'Cannot modify a completed flight',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check modification policy (48 hours before departure)
      const departureTime = booking.outboundFlights?.[0]?.departureTime;
      if (departureTime) {
        const hoursUntilDeparture =
          (new Date(departureTime).getTime() - new Date().getTime()) /
          (1000 * 60 * 60);
        if (hoursUntilDeparture < 48) {
          throw new HttpException(
            'Cannot modify booking within 48 hours of departure',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Validate modifications
      if (modifications.passengers) {
        this.passengerValidationService.validatePassengers(
          modifications.passengers,
        );
      }

      // Update passenger information if provided
      if (modifications.passengers) {
        // Delete existing passengers
        await this.prisma.passenger.deleteMany({
          where: { flightBookingId: bookingId },
        });

        // Create new passengers
        for (const passengerData of modifications.passengers) {
          await this.prisma.passenger.create({
            data: {
              flightBookingId: bookingId,
              firstName: passengerData.name.firstName,
              lastName: passengerData.name.lastName,
              middleName: passengerData.name.middleName,
              dateOfBirth: new Date(passengerData.dateOfBirth),
              gender: passengerData.gender,
              documentType: this.mapDocumentType(
                passengerData.documents[0].documentType,
              ) as any,
              documentNumber: passengerData.documents[0].number,
              documentExpiry: passengerData.documents[0].expiryDate
                ? new Date(passengerData.documents[0].expiryDate)
                : null,
              issuingCountry: passengerData.documents[0].issuanceCountry,
              nationality: passengerData.documents[0].nationality,
              email: passengerData.contact?.emailAddress,
              phone: passengerData.contact?.phones?.[0]?.number,
              isLeadPassenger:
                passengerData.id === modifications.passengers[0].id,
            },
          });
        }
      }

      // Update contact information if provided
      if (modifications.contactInfo) {
        await this.prisma.flightBooking.update({
          where: { id: bookingId },
          data: {
            contactInfo: {
              email: modifications.contactInfo.email,
              phone: modifications.contactInfo.phone,
              countryCode: modifications.contactInfo.countryCode,
            },
          },
        });
      }

      // Get updated booking
      const updatedBooking = await this.getFlightBooking(bookingId, userId);

      this.logger.log(`Flight booking modified successfully: ${bookingId}`);
      return updatedBooking;
    } catch (error) {
      this.logger.error('Flight booking modification failed', error);
      throw error;
    }
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  private calculateRefundAmount(booking: any, departureTime?: Date): number {
    const totalAmount = booking.totalPrice;

    if (!departureTime) {
      // If no departure time, apply standard cancellation fee
      return Math.max(0, totalAmount - 50); // $50 cancellation fee
    }

    const hoursUntilDeparture =
      (new Date(departureTime).getTime() - new Date().getTime()) /
      (1000 * 60 * 60);

    if (hoursUntilDeparture >= 24) {
      // More than 24 hours: 90% refund
      return totalAmount * 0.9;
    } else if (hoursUntilDeparture >= 2) {
      // 2-24 hours: 50% refund
      return totalAmount * 0.5;
    } else {
      // Less than 2 hours: No refund
      return 0;
    }
  }
}