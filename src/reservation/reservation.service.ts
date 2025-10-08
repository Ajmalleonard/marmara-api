import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import {
  CreateReservationDto,
  FormattedTripDataDto,
} from './dto/create-reservation.dto';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private whatsAppService: WhatsAppService,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const reservation = await this.prisma.reservation.create({
      data: {
        adults: Number(createReservationDto.adults),
        children: createReservationDto.children
          ? Number(createReservationDto.children)
          : null,
        email: createReservationDto.email,
        location: createReservationDto.location,
        name: createReservationDto.name,
        returnDate: createReservationDto.returnDate,
        rooms: Number(createReservationDto.rooms),
        startDate: createReservationDto.startDate,
        status: ReservationStatus.PENDING,
        userId: createReservationDto.userId,
      },
    });

    if (!reservation) {
      return {
        statusCode: 400,
        message: 'Failed to create reservation',
        error: 'Reservation creation failed',
      };
    }

    return {
      statusCode: 201,
      message: 'Reservation created successfully',
      data: reservation,
    };
  }
  async findAll() {
    try {
      const reservations = await this.prisma.reservation.findMany();
      return {
        statusCode: 200,
        message: 'Reservations retrieved successfully',
        data: reservations,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Failed to retrieve reservations',
        error: error.message,
      };
    }
  }

  async findOne(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: ReservationStatus) {
    return this.prisma.reservation.update({
      where: { id },
      data: { status },
    });
  }

  async planner(data: FormattedTripDataDto) {
    try {
      // Create the trip plan in database
      const tripPlan = await this.prisma.formattedTripData.create({
        data,
      });

      // Send WhatsApp notifications
      if (data.contactInfo?.phone) {
        // Use destination as fallback for customer name since ContactInfo doesn't have name
        const customerName = 'Valued Customer'; // Generic greeting since name is not available in ContactInfo

        // Send notification to customer
        await this.whatsAppService.sendTripPlanNotification(
          data.contactInfo.phone,
          customerName,
          data.destination,
        );

        // Send notification to admin team
        await this.whatsAppService.sendAdminNotification(
          customerName,
          data.destination,
          data.contactInfo.phone,
        );
      }

      return tripPlan;
    } catch (error) {
      // If WhatsApp fails, still return the created trip plan
      console.error('WhatsApp notification failed:', error);
      throw error;
    }
  }
}
