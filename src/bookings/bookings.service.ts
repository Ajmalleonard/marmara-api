import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBooking } from './dto/update-booking.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  sendBookingConfirmationEmail,
  sendAdminBookingEmail,
} from '../emails/emails';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const Package = await this.prisma.package.findUnique({
      where: { id: createBookingDto.packageId },
    });

    if (!Package) {
      throw new NotFoundException('Package not found');
    }

    const booking = await this.prisma.booking.create({
      data: {
        ...createBookingDto,
        userId,
        status: 'pending',
      },
      include: {
        user: true,
        package: true,
      },
    });

    const bookingData = {
      name: booking.user.name,
      email: booking.user.email,
      packageId: booking.packageId,
      packageName: booking.package.name,
      startDate: booking.startDate.toLocaleDateString(),
      endDate: booking.endDate.toLocaleDateString(),
      adults: booking.adults,
      children: booking.children || 0,
      infants: booking.infants || 0,
      pets: booking.pets || 0,
      price: booking.totalPrice,
    };

    await sendBookingConfirmationEmail(booking.user.email, bookingData);
    await sendAdminBookingEmail(bookingData);

    return booking;
  }

  async findAll(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.booking.findMany({
        include: {
          user: true,
          package: true,
        },
      });
    }

    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        package: true,
      },
    });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        package: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBooking,
    userId: string,
    isAdmin: boolean,
  ) {
    const booking = await this.findOne(id, userId, isAdmin);

    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Only admin can change status to confirmed or completed
    if (updateBookingDto.status) {
      if (
        !isAdmin &&
        ['confirmed', 'completed'].includes(updateBookingDto.status)
      ) {
        throw new ForbiddenException(
          'Only administrators can confirm or complete bookings',
        );
      }

      // Users can only cancel their own bookings
      if (
        !isAdmin &&
        updateBookingDto.status === 'canceled' &&
        booking.userId !== userId
      ) {
        throw new ForbiddenException('You can only cancel your own bookings');
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        user: true,
        package: true,
      },
    });
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const booking = await this.findOne(id, userId, isAdmin);

    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await this.findOne(id, userId, false);

    if (booking.status === 'completed') {
      throw new ForbiddenException('Cannot cancel a completed booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'canceled' },
    });
  }
}
