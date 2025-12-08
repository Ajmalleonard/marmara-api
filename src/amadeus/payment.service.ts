import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, RefundStatus, RefundType, PaymentProvider } from '@prisma/client';

// Import PesaPal SDK
import PesaPal from 'pesapaljs-v3';

// Payment interfaces
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  status: PaymentStatus;
  receiptUrl?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: RefundStatus;
  error?: string;
}

// DTOs
export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  flightBookingId: string;
  userId: string;
  provider?: PaymentProvider; // Add provider selection
  metadata?: Record<string, any>;
}

export interface ProcessPaymentDto {
  paymentIntentId: string;
  flightBookingId: string;
  userId: string;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  refundType?: RefundType;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private pesapal: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize PesaPal
    const pesapalKey = this.configService.get<string>('PESAPAL_CONSUMER_KEY');
    const pesapalSecret = this.configService.get<string>('PESAPAL_CONSUMER_SECRET');
    const pesapalDebug = this.configService.get<boolean>('PESAPAL_DEBUG', true);

    if (!pesapalKey || !pesapalSecret) {
      this.logger.warn('PesaPal credentials not configured. PesaPal payment processing will be disabled.');
    } else {
      this.pesapal = PesaPal.init({
        key: pesapalKey,
        secret: pesapalSecret,
        debug: pesapalDebug,
      });
    }
  }

  /**
   * Create a payment intent for flight booking
   */
  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    try {
      // Verify flight booking exists and belongs to user
      const flightBooking = await this.prisma.flightBooking.findFirst({
        where: {
          id: dto.flightBookingId,
          userId: dto.userId,
        },
      });

      if (!flightBooking) {
        throw new BadRequestException('Flight booking not found or access denied');
      }

      // Calculate service fees
      const serviceFee = this.calculateServiceFee(dto.amount);
      const processingFee = this.calculateProcessingFee(dto.amount);
      const totalAmount = dto.amount + serviceFee + processingFee;

      this.logger.log(`Creating payment intent for amount: ${dto.amount}, total: ${totalAmount}`);

      // Only support PesaPal now
      return await this.createPesapalPaymentIntent(dto, serviceFee, processingFee, totalAmount);
    } catch (error) {
      this.logger.error('Failed to create payment intent', error.stack);
      throw error;
    }
  }

  /**
   * Create PesaPal payment intent
   */
  private async createPesapalPaymentIntent(
    dto: CreatePaymentIntentDto,
    serviceFee: number,
    processingFee: number,
    totalAmount: number
  ): Promise<PaymentIntent> {
    if (!this.pesapal) {
      throw new InternalServerErrorException('PesaPal is not configured');
    }

    try {
      // Authenticate with PesaPal
      await this.pesapal.authenticate();

      // Get user details for billing address
       const user = await this.prisma.user.findUnique({
         where: { id: dto.userId },
       });

       if (!user) {
         throw new BadRequestException('User not found');
       }

       // Generate unique order ID
       const orderId = `flight_${dto.flightBookingId}_${Date.now()}`;

       // Submit order to PesaPal
       const pesapalOrder = await this.pesapal.submit_order({
         id: orderId,
         currency: dto.currency,
         amount: totalAmount,
         description: `Flight booking payment - ${dto.flightBookingId}`,
         callback_url: this.configService.get<string>('PESAPAL_CALLBACK_URL', 'http://localhost:3000/payment/callback'),
         notification_id: this.configService.get<string>('PESAPAL_NOTIFICATION_ID'),
         billing_address: {
           email_address: user.email,
           phone_number: '', // User model doesn't have phone field
           country_code: 'KE', // Default to Kenya
           first_name: user.name.split(' ')[0] || '',
           middle_name: '',
           last_name: user.name.split(' ').slice(1).join(' ') || '',
           line_1: '',
           line_2: '',
           city: '',
           state: '',
           postal_code: '',
           zip_code: ''
         }
       });

      // Create payment record in database
      await this.prisma.payment.create({
        data: {
          amount: dto.amount,
          currency: dto.currency,
          paymentMethod: 'pesapal',
          provider: PaymentProvider.PESAPAL,
          status: PaymentStatus.PENDING,
          pesapalOrderId: orderId,
          serviceFee,
          processingFee,
          totalFees: serviceFee + processingFee,
          flightBookingId: dto.flightBookingId,
          userId: dto.userId,
        },
      });

      return {
        id: orderId,
        clientSecret: pesapalOrder.redirect_url || pesapalOrder.iframe_src,
        amount: totalAmount,
        currency: dto.currency,
        status: 'requires_action', // PesaPal requires user action
      };
    } catch (error) {
      this.logger.error('Failed to create PesaPal payment intent', error);
      throw new InternalServerErrorException('Failed to create PesaPal payment intent');
    }
  }

  /**
   * Test PesaPal connection without database dependencies
   */
  async testPesapalConnection(testDto: {
    amount: number;
    currency: string;
    description?: string;
  }): Promise<any> {
    try {
      if (!this.pesapal) {
        return {
          success: false,
          error: 'PesaPal is not configured',
          config: {
            key: !!this.configService.get<string>('PESAPAL_CONSUMER_KEY'),
            secret: !!this.configService.get<string>('PESAPAL_CONSUMER_SECRET'),
          },
        };
      }

      // Test authentication
      const authResult = await this.pesapal.authenticate();
      
      return {
        success: true,
        message: 'PesaPal connection successful',
        authResult,
        testData: testDto,
        config: {
          key: !!this.configService.get<string>('PESAPAL_CONSUMER_KEY'),
          secret: !!this.configService.get<string>('PESAPAL_CONSUMER_SECRET'),
          debug: this.configService.get<boolean>('PESAPAL_DEBUG', true),
        },
      };
    } catch (error) {
      this.logger.error('PesaPal connection test failed', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        config: {
          key: !!this.configService.get<string>('PESAPAL_CONSUMER_KEY'),
          secret: !!this.configService.get<string>('PESAPAL_CONSUMER_SECRET'),
          debug: this.configService.get<boolean>('PESAPAL_DEBUG', true),
        },
      };
    }
  }

  /**
   * Process payment after user completes payment flow
   */
  async processPayment(dto: ProcessPaymentDto): Promise<PaymentResult> {
    try {
      // Find payment record
      const payment = await this.prisma.payment.findFirst({
        where: {
          pesapalOrderId: dto.paymentIntentId,
          flightBookingId: dto.flightBookingId,
          userId: dto.userId,
        },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // Only support PesaPal now
      return this.processPesapalPayment(payment, dto.paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to process payment', error.stack);
      throw error;
    }
  }

  /**
   * Process PesaPal payment
   */
  private async processPesapalPayment(payment: any, orderId: string): Promise<PaymentResult> {
    if (!this.pesapal) {
      throw new InternalServerErrorException('PesaPal is not configured');
    }

    try {
      // Check transaction status with PesaPal
      const transactionStatus = await this.pesapal.get_transaction_status({
        OrderTrackingId: orderId
      });

      if (transactionStatus.payment_status_description === 'Completed') {
        // Update payment status
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            pesapalTrackingId: transactionStatus.OrderTrackingId,
          },
        });

        // Update flight booking status
        await this.prisma.flightBooking.update({
          where: { id: payment.flightBookingId },
          data: { paymentStatus: PaymentStatus.COMPLETED },
        });

        return {
          success: true,
          paymentId: payment.id,
          transactionId: transactionStatus.OrderTrackingId,
          status: PaymentStatus.COMPLETED,
        };
      } else {
        // Update payment status to failed
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureReason: transactionStatus.payment_status_description,
          },
        });

        return {
          success: false,
          paymentId: payment.id,
          transactionId: transactionStatus.OrderTrackingId,
          status: PaymentStatus.FAILED,
          error: transactionStatus.payment_status_description,
        };
      }
    } catch (error) {
      this.logger.error('Failed to process PesaPal payment', error);
      throw new InternalServerErrorException('Failed to process PesaPal payment');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(dto: RefundPaymentDto): Promise<RefundResult> {
    try {
      // Find payment record
      const payment = await this.prisma.payment.findUnique({
        where: { id: dto.paymentId },
        include: { flightBooking: true },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException('Cannot refund a payment that is not completed');
      }

      const refundAmount = dto.amount || payment.amount;
      const refundProcessingFee = this.calculateRefundProcessingFee(refundAmount);
      const refundFee = this.calculateRefundFee(refundAmount);
      const netRefundAmount = refundAmount - refundProcessingFee - refundFee;

      // Only support PesaPal now
      return this.refundPesapalPayment(payment, refundAmount, netRefundAmount, dto);
    } catch (error) {
      this.logger.error('Failed to process refund', error.stack);
      throw error;
    }
  }

  /**
   * Refund PesaPal payment (Note: PesaPal may not support automatic refunds)
   */
  private async refundPesapalPayment(
    payment: any,
    refundAmount: number,
    netRefundAmount: number,
    dto: RefundPaymentDto
  ): Promise<RefundResult> {
    // PesaPal typically requires manual refund processing
     // Create refund record with pending status
     const refundRecord = await this.prisma.refund.create({
       data: {
         amount: refundAmount,
         netRefundAmount: netRefundAmount,
         processingFee: this.calculateRefundProcessingFee(refundAmount),
         refundFee: this.calculateRefundFee(refundAmount),
         reason: dto.reason,
         refundType: dto.refundType || RefundType.FULL,
         status: RefundStatus.PENDING, // Manual processing required
         originalPaymentId: payment.id,
         userId: payment.userId,
         flightBookingId: payment.flightBookingId,
       },
     });

    this.logger.warn(`PesaPal refund created for manual processing: ${refundRecord.id}`);

    return {
      success: true,
      refundId: refundRecord.id,
      amount: netRefundAmount,
      status: RefundStatus.PENDING,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      success: payment.status === PaymentStatus.COMPLETED,
      paymentId: payment.id,
      transactionId: payment.stripePaymentIntentId || payment.pesapalOrderId || undefined,
      status: payment.status,
      receiptUrl: payment.receiptUrl || undefined,
    };
  }

  /**
   * Handle PesaPal callback/IPN notifications
   */
  async handlePesapalCallback(callbackData: {
    orderTrackingId: string;
    orderMerchantReference?: string;
    callbackData: any;
  }): Promise<PaymentResult> {
    try {
      if (!this.pesapal) {
        throw new InternalServerErrorException('PesaPal is not configured');
      }

      const { orderTrackingId, orderMerchantReference } = callbackData;

      // Find payment record by PesaPal order ID or tracking ID
      const payment = await this.prisma.payment.findFirst({
        where: {
          OR: [
            { pesapalOrderId: orderMerchantReference },
            { pesapalTrackingId: orderTrackingId },
          ],
        },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for PesaPal callback: ${orderTrackingId}`);
        throw new BadRequestException('Payment not found for callback');
      }

      // Check transaction status with PesaPal
      const transactionStatus = await this.pesapal.get_transaction_status({
        OrderTrackingId: orderTrackingId
      });

      this.logger.log(`PesaPal transaction status: ${JSON.stringify(transactionStatus)}`);

      if (transactionStatus.payment_status_description === 'Completed') {
        // Update payment status to completed
        const updatedPayment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            pesapalTrackingId: orderTrackingId,
          },
        });

        // Update flight booking status
        await this.prisma.flightBooking.update({
          where: { id: payment.flightBookingId },
          data: { paymentStatus: PaymentStatus.COMPLETED },
        });

        this.logger.log(`Payment completed via PesaPal callback: ${payment.id}`);

        return {
          success: true,
          paymentId: payment.id,
          transactionId: orderTrackingId,
          status: PaymentStatus.COMPLETED,
        };
      } else if (transactionStatus.payment_status_description === 'Failed') {
        // Update payment status to failed
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureReason: transactionStatus.payment_status_description,
          },
        });

        this.logger.log(`Payment failed via PesaPal callback: ${payment.id}`);

        return {
          success: false,
          paymentId: payment.id,
          transactionId: orderTrackingId,
          status: PaymentStatus.FAILED,
          error: transactionStatus.payment_status_description,
        };
      } else {
        // Payment is still pending or in another state
        this.logger.log(`Payment status unchanged via PesaPal callback: ${payment.id}, status: ${transactionStatus.payment_status_description}`);

        return {
          success: false,
          paymentId: payment.id,
          transactionId: orderTrackingId,
          status: payment.status,
          error: `Payment status: ${transactionStatus.payment_status_description}`,
        };
      }
    } catch (error) {
      this.logger.error('Failed to handle PesaPal callback', error);
      throw error;
    }
  }

  // Fee calculation methods
  private calculateServiceFee(amount: number): number {
    return Math.round(amount * 0.025 * 100) / 100; // 2.5% service fee
  }

  private calculateProcessingFee(amount: number): number {
    return Math.round((2.50 + amount * 0.029) * 100) / 100; // $2.50 + 2.9%
  }

  private calculateRefundProcessingFee(amount: number): number {
    return Math.round(amount * 0.01 * 100) / 100; // 1% processing fee
  }

  private calculateRefundFee(amount: number): number {
    return Math.min(25, Math.round(amount * 0.05 * 100) / 100); // 5% or $25 max
  }
}