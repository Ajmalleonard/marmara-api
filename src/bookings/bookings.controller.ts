import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBooking } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { GetUser } from '../decorators/Auth.decorator';
import { User } from '@prisma/client';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: User) {
    return this.bookingsService.create(createBookingDto, user.id);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.bookingsService.findAll(user.id, user.isAdmin);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingsService.findOne(id, user.id, user.isAdmin);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBooking,
    @GetUser() user: User,
  ) {
    return this.bookingsService.update(
      id,
      updateBookingDto,
      user.id,
      user.isAdmin,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingsService.remove(id, user.id, user.isAdmin);
  }

  @Post(':id/cancel')
  cancelBooking(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingsService.cancelBooking(id, user.id);
  }
}
