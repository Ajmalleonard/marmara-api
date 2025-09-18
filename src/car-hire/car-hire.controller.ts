import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CarHireService } from './car-hire.service';
import { CreateCarBookingInput } from './dto/create-car-booking.input';

@Controller('car-hire')
export class CarHireController {
  constructor(private carHireService: CarHireService) {}

  @Get('cars')
  async getCars() {
    console.log('🚗 GET /car-hire/cars - Fetching all cars');
    const cars = await this.carHireService.getAllCars();
    console.log('✅ Cars fetched successfully:', cars.length, 'cars found');
    return cars;
  }

  @Get('cars/type/:type')
  async getCarsByType(@Param('type') type: string) {
    console.log('🚗 GET /car-hire/cars/type/' + type + ' - Fetching cars by type');
    const cars = await this.carHireService.getCarsByType(type);
    console.log('✅ Cars by type fetched successfully:', cars.length, 'cars found');
    return cars;
  }

  @Get('cars/:id')
  async getCar(@Param('id') id: string) {
    console.log('🚗 GET /car-hire/cars/' + id + ' - Fetching car by ID');
    const car = await this.carHireService.getCarById(id);
    console.log('✅ Car fetched successfully:', car);
    return car;
  }

  @Post('bookings')
  async createCarBooking(@Body() createCarBookingInput: CreateCarBookingInput) {
    console.log('🚗 POST /car-hire/bookings - Creating car booking:', createCarBookingInput);
    const booking = await this.carHireService.createCarBooking(createCarBookingInput);
    console.log('✅ Car booking created successfully:', booking);
    return booking;
  }
}