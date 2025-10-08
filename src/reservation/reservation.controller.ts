import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateReservationDto,
  FormattedTripDataDto,
} from './dto/create-reservation.dto';
import { ReservationsService } from '@/reservation/reservation.service';
import { ReservationStatus } from '@prisma/client';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReservationStatus,
  ) {
    return this.reservationsService.updateStatus(id, status);
  }

  @Post('planner')
  async planner(@Body() data: FormattedTripDataDto) {
    console.log(data);
    return this.reservationsService.planner(data);
  }
}
