import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarBookingInput } from './dto/create-car-booking.input';
import { CarBooking, BookingStatus } from './models/car-booking.model';
import { Car } from './models/car.model';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CarHireService {
  private cars: Car[] = [
    {
      id: '1',
      name: 'Toyota Land Cruiser',
      image:
        'https://marmaraholidaysproduction.s3.eu-north-1.amazonaws.com/uploads/1738886799705-017.jpg',
      price: 120,
      type: 'SUV',
      seats: 7,
      transmission: 'Automatic',
      airCon: true,
      engine: 'Diesel',
      features: ['4x4', 'GPS', 'Roof rack', 'Safari equipped'],
    },
    {
      id: '2',
      name: 'Toyota Hilux',
      image:
        'https://marmaraholidaysproduction.s3.eu-north-1.amazonaws.com/uploads/1741547961421-IMG_7790.jpg',
      price: 95,
      type: 'Pickup',
      seats: 5,
      transmission: 'Manual',
      airCon: true,
      engine: 'Diesel',
      features: ['4x4', 'High clearance', 'Durable'],
    },
    {
      id: '3',
      name: 'Toyota Corolla',
      image:
        'https://marmaraholidaysproduction.s3.eu-north-1.amazonaws.com/uploads/1741547434744-DSC03814.jpg',
      price: 65,
      type: 'Sedan',
      seats: 5,
      transmission: 'Automatic',
      airCon: true,
      engine: 'Petrol',
      features: ['Fuel efficient', 'City driving', 'Comfortable'],
    },
    {
      id: '4',
      name: 'Nissan Urvan',
      image:
        'https://marmaraholidaysproduction.s3.eu-north-1.amazonaws.com/uploads/1741547687395-ZURI_Sundowners.jpg',
      price: 150,
      type: 'Van',
      seats: 12,
      transmission: 'Manual',
      airCon: true,
      engine: 'Diesel',
      features: ['Group travel', 'Spacious', 'Luggage space'],
    },
  ];

  constructor(private prisma: PrismaService) {}

  async getAllCars(): Promise<Car[]> {
    // In a real implementation, we would fetch from database
    return this.cars;
  }

  async getCarsByType(type: string): Promise<Car[]> {
    // In a real implementation, we would fetch from database with filters
    return this.cars.filter(
      (car) => car.type.toLowerCase() === type.toLowerCase(),
    );
  }

  async getCarById(id: string): Promise<Car> {
    // In a real implementation, we would fetch from database
    const car = this.cars.find((car) => car.id === id);
    if (!car) {
      throw new Error(`Car with ID ${id} not found`);
    }
    return car;
  }

  async createCarBooking(
    createCarBookingInput: CreateCarBookingInput,
  ): Promise<CarBooking> {
    // In a real implementation, we would save this to the database
    const carBooking = {
      id: Math.random().toString(36).substring(7),
      ...createCarBookingInput,
      status: BookingStatus.PENDING,
      createdAt: new Date(),
    };

    // Send an email notification
    await this.sendBookingEmail(carBooking);

    return carBooking;
  }

  private async sendBookingEmail(booking: CarBooking): Promise<void> {
    try {
      // Create reusable transporter object using SMTP transport
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send mail with defined transport object
      await transporter.sendMail({
        from: `"Marmara Holidays" <${process.env.EMAIL_FROM}>`,
        to: process.env.ADMIN_EMAIL, // Admin email
        cc: booking.email, // Also send to the requester
        subject: `New Car Booking - ${booking.fullName}`,
        html: `
          <h1>New Car Booking</h1>
          <p><strong>Name:</strong> ${booking.fullName}</p>
          <p><strong>Email:</strong> ${booking.email}</p>
          <p><strong>Pickup Location:</strong> ${booking.pickupLocation}</p>
          <p><strong>Dropoff Location:</strong> ${booking.dropoffLocation}</p>
          <p><strong>Pickup Date:</strong> ${booking.pickupDate}</p>
          <p><strong>Return Date:</strong> ${booking.returnDate}</p>
          <p><strong>Vehicle Type:</strong> ${booking.vehicleType}</p>
          <p><strong>With Driver:</strong> ${booking.withDriver ? 'Yes' : 'No'}</p>
          <p><strong>Special Requests:</strong> ${booking.specialRequests || 'None'}</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
