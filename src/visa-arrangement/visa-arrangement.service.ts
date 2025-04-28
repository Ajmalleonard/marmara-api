import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { VisaRequest } from './models/visa-request.model';
import { CreateVisaRequestInput } from './dto/create-visa-request.input';
import { VisaType } from './models/visa-type.enum';

@Injectable()
export class VisaArrangementService {
  constructor(private prisma: PrismaService) {}

  async submitVisaRequest(
    createVisaRequestInput: CreateVisaRequestInput,
  ): Promise<VisaRequest> {
    // In a real implementation, we would save this to the database
    // For now, we'll just create an object and return it
    const visaRequest = {
      id: Math.random().toString(36).substring(7),
      ...createVisaRequestInput,
      status: 'PENDING',
      createdAt: new Date(),
    };

    // Send an email notification
    await this.sendVisaRequestEmail(visaRequest);

    return visaRequest;
  }

  private async sendVisaRequestEmail(visaRequest: VisaRequest): Promise<void> {
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
        cc: visaRequest.email, // Also send to the requester
        subject: `New Visa Request - ${visaRequest.firstName} ${visaRequest.lastName}`,
        html: `
          <h1>New Visa Request</h1>
          <p><strong>Name:</strong> ${visaRequest.firstName} ${visaRequest.lastName}</p>
          <p><strong>Email:</strong> ${visaRequest.email}</p>
          <p><strong>Phone:</strong> ${visaRequest.phone}</p>
          <p><strong>Nationality:</strong> ${visaRequest.nationality}</p>
          <p><strong>Visa Type:</strong> ${visaRequest.visaType}</p>
          <p><strong>Arrival Date:</strong> ${visaRequest.arrivalDate}</p>
          <p><strong>Departure Date:</strong> ${visaRequest.departureDate}</p>
          <p><strong>Additional Information:</strong> ${visaRequest.additionalInfo || 'None'}</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async getVisaTypes(): Promise<VisaType[]> {
    // In a real implementation, we would fetch from database
    // For now, we'll return a predefined list
    return [
      {
        id: 'tourist',
        name: 'Tourist Visa',
        description: 'For tourism purposes',
        price: 50,
      },
      {
        id: 'business',
        name: 'Business Visa',
        description: 'For business activities',
        price: 100,
      },
      {
        id: 'transit',
        name: 'Transit Visa',
        description: 'For passing through Tanzania',
        price: 30,
      },
    ];
  }
}
