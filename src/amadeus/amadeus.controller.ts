import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AmadeusService } from './amadeus.service';
import { ReferenceDataService } from './reference-data.service';
import { FlightSearchDto, FlightInspirationDto, FlightBookingDto, AirportCitySearchDto, AirlineCodeLookupDto } from './dto/flight-search.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';

@Controller('amadeus')
export class AmadeusController {
  constructor(
    private readonly amadeusService: AmadeusService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  /**
   * Search for flight offers
   * GET /amadeus/flights/search
   */
  @Get('flights/search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchFlights(@Query() searchDto: FlightSearchDto) {
    return this.amadeusService.searchFlights(searchDto);
  }

  /**
   * Search for flight inspiration (destinations)
   * GET /amadeus/flights/inspiration
   */
  @Get('flights/inspiration')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchFlightInspiration(@Query() searchDto: FlightInspirationDto) {
    return this.amadeusService.searchFlightInspiration(searchDto);
  }

  /**
   * Search for airports and cities using reference data service
   * GET /amadeus/reference-data/locations
   */
  @Get('reference-data/locations')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchAirportsAndCities(@Query() searchDto: AirportCitySearchDto) {
    return this.referenceDataService.searchLocations(searchDto);
  }

  /**
   * Lookup airline codes using reference data service
   * GET /amadeus/reference-data/airlines
   */
  @Get('reference-data/airlines')
  @UsePipes(new ValidationPipe({ transform: true }))
  async lookupAirlineCodes(@Query() searchDto: AirlineCodeLookupDto) {
    return this.referenceDataService.lookupAirlines(searchDto);
  }

  /**
   * Get popular airports
   * GET /amadeus/reference-data/popular-airports
   */
  @Get('reference-data/popular-airports')
  async getPopularAirports() {
    return this.referenceDataService.getPopularAirports();
  }

  /**
   * Create a flight booking
   * POST /amadeus/flights/book
   */
  @Post('flights/book')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createFlightBooking(
    @Body() bookingDto: FlightBookingDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.amadeusService.createFlightBooking(bookingDto, userId);
  }

  /**
   * Get a specific flight booking
   * GET /amadeus/bookings/:id
   */
  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  async getFlightBooking(
    @Param('id') bookingId: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.amadeusService.getFlightBooking(bookingId, userId);
  }

  /**
   * Cancel a flight booking
   * POST /amadeus/bookings/:id/cancel
   */
  @Post('bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelFlightBooking(
    @Param('id') bookingId: string,
    @Body() body: { cancellationReason?: string },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.amadeusService.cancelFlightBooking(bookingId, userId, body.cancellationReason);
  }

  /**
   * Modify a flight booking
   * PUT /amadeus/bookings/:id
   */
  @Put('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async modifyFlightBooking(
    @Param('id') bookingId: string,
    @Body() modifications: any,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.amadeusService.modifyFlightBooking(bookingId, userId, modifications);
  }

  /**
   * Get user's flight bookings
   * GET /amadeus/bookings
   */
  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  async getUserFlightBookings(@Request() req: any) {
    const userId = req.user.id;
    return this.amadeusService.getUserFlightBookings(userId);
  }

  /**
   * Health check endpoint for Amadeus service
   * GET /amadeus/health
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      service: 'amadeus',
      timestamp: new Date().toISOString(),
      message: 'Amadeus service is running',
    };
  }
}