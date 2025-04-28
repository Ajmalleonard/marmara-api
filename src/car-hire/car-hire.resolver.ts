import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CarHireService } from './car-hire.service';
import { Car } from './models/car.model';
import { CarBooking } from './models/car-booking.model';
import { CreateCarBookingInput } from './dto/create-car-booking.input';

@Resolver(() => Car)
export class CarHireResolver {
  constructor(private carHireService: CarHireService) {}

  @Query(() => [Car], { name: 'cars' })
  async getCars(): Promise<Car[]> {
    return this.carHireService.getAllCars();
  }

  @Query(() => [Car], { name: 'carsByType' })
  async getCarsByType(@Args('type') type: string): Promise<Car[]> {
    return this.carHireService.getCarsByType(type);
  }

  @Query(() => Car, { name: 'car' })
  async getCar(@Args('id') id: string): Promise<Car> {
    return this.carHireService.getCarById(id);
  }

  @Mutation(() => CarBooking)
  async createCarBooking(
    @Args('createCarBookingInput') createCarBookingInput: CreateCarBookingInput,
  ): Promise<CarBooking> {
    return this.carHireService.createCarBooking(createCarBookingInput);
  }
}
