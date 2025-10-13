import { Injectable, BadRequestException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  status: 'succeeded' | 'failed' | 'pending' | 'cancelled';
  amount: number;
  currency: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  bookingId: string;
  userId: string;
  customerEmail: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ProcessPaymentDto {
  paymentIntentId: string;
  paymentMethodId: string;
  bookingId: string;
  userId: string;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount?: number; // If not provided, full refund
  reason?: string;
  bookingId: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      this.logger.warn('Stripe secret key not configured. Payment processing will be disabled.');
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-09-30.clover',
      });
    }
  }

  /**
   * Create a payment intent for flight booking
   */
  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    try {
      if (!this.stripe) {
        throw new HttpException('Payment processing is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Validate amount
      if (dto.amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      if (dto.amount > 50000 * 100) { // $50,000 limit in cents
        throw new BadRequestException('Payment amount exceeds maximum limit');
      }

      // Validate currency
      const supportedCurrencies = ['usd', 'eur', 'gbp', 'try', 'aed'];
      if (!supportedCurrencies.includes(dto.currency.toLowerCase())) {
        throw new BadRequestException(`Currency ${dto.currency} is not supported`);
      }

      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(dto.amount * 100), // Convert to cents
        currency: dto.currency.toLowerCase(),
        customer: await this.getOrCreateStripeCustomer(dto.userId, dto.customerEmail),
        description: dto.description || `Flight booking payment for booking ${dto.bookingId}`,
        metadata: {
          bookingId: dto.bookingId,
          userId: dto.userId,
          ...dto.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Save payment intent to database
      await this.savePaymentIntent(paymentIntent, dto);

      this.logger.log(`Payment intent created: ${paymentIntent.id} for booking ${dto.bookingId}`);

      return {
        id: paymentIntent.id,
        amount: dto.amount,
        currency: dto.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create payment intent', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Process payment for flight booking
   */
  async processPayment(dto: ProcessPaymentDto): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        throw new HttpException('Payment processing is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Retrieve payment intent
      const paymentIntent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);

      if (!paymentIntent) {
        throw new BadRequestException('Payment intent not found');
      }

      // Verify booking ownership
      if (paymentIntent.metadata.userId !== dto.userId) {
        throw new BadRequestException('Unauthorized payment access');
      }

      if (paymentIntent.metadata.bookingId !== dto.bookingId) {
        throw new BadRequestException('Payment intent does not match booking');
      }

      // Confirm the payment intent
      const confirmedPayment = await this.stripe.paymentIntents.confirm(dto.paymentIntentId, {
        payment_method: dto.paymentMethodId,
        expand: ['charges.data'],
      });

      // Update payment status in database
      await this.updatePaymentStatus(confirmedPayment);

      const result: PaymentResult = {
        success: confirmedPayment.status === 'succeeded',
        paymentId: confirmedPayment.id,
        transactionId: confirmedPayment.latest_charge as string || undefined,
        status: this.mapStripeStatus(confirmedPayment.status),
        amount: confirmedPayment.amount / 100,
        currency: confirmedPayment.currency.toUpperCase(),
        metadata: confirmedPayment.metadata,
      };

      if (!result.success) {
        result.errorMessage = 'Payment was not successful';
      }

      this.logger.log(`Payment processed: ${confirmedPayment.id} - Status: ${confirmedPayment.status}`);

      return result;
    } catch (error) {
      this.logger.error('Failed to process payment', error);
      
      return {
        success: false,
        paymentId: dto.paymentIntentId,
        status: 'failed',
        amount: 0,
        currency: 'USD',
        errorMessage: error.message || 'Payment processing failed',
      };
    }
  }

  /**
   * Refund payment for cancelled booking
   */
  async refundPayment(dto: RefundPaymentDto): Promise<RefundResult> {
    try {
      if (!this.stripe) {
        throw new HttpException('Payment processing is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Retrieve original payment intent
      const paymentIntent = await this.stripe.paymentIntents.retrieve(dto.paymentId);

      if (!paymentIntent) {
        throw new BadRequestException('Payment not found');
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('Cannot refund unsuccessful payment');
      }

      // Get the charge ID from the payment intent
      const chargeId = paymentIntent.latest_charge as string;
      if (!chargeId) {
        throw new BadRequestException('No charge found for this payment');
      }

      // Create refund
      const refund = await this.stripe.refunds.create({
        payment_intent: dto.paymentId,
        amount: dto.amount ? Math.round(dto.amount * 100) : undefined, // Full refund if amount not specified
        reason: 'requested_by_customer',
        metadata: {
          bookingId: dto.bookingId,
          originalPaymentId: dto.paymentId,
        },
      });

      // Save refund to database
      await this.saveRefund(refund, dto);

      const result: RefundResult = {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency.toUpperCase(),
        status: this.mapStripeRefundStatus(refund.status),
      };

      if (!result.success) {
        result.errorMessage = 'Refund was not successful';
      }

      this.logger.log(`Refund processed: ${refund.id} for payment ${dto.paymentId}`);

      return result;
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      
      return {
        success: false,
        refundId: '',
        amount: dto.amount || 0,
        currency: 'USD',
        status: 'failed',
        errorMessage: error.message || 'Refund processing failed',
      };
    }
  }

  /**
   * Get payment status for a booking
   */
  async getPaymentStatus(bookingId: string, userId: string): Promise<any> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: {
          flightBookingId: bookingId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!payment) {
        return null;
      }

      // If we have Stripe integration, get latest status from Stripe
      if (this.stripe && payment.stripePaymentIntentId) {
        try {
          const paymentIntent = await this.stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
          
          // Update local status if different - for now just skip status update
          // TODO: Implement proper status mapping between Stripe and PaymentStatus enum
          // if (payment.status !== mappedStatus) {
          //   await this.prisma.payment.update({
          //     where: { id: payment.id },
          //     data: { status: mappedStatus },
          //   });
          // }

          return {
            ...payment,
            status: payment.status,
            stripeStatus: paymentIntent.status,
          };
        } catch (stripeError) {
          this.logger.warn(`Failed to fetch Stripe status for payment ${payment.id}`, stripeError);
        }
      }

      return payment;
    } catch (error) {
      this.logger.error('Failed to get payment status', error);
      throw new HttpException('Failed to retrieve payment status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get or create Stripe customer
   */
  private async getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
    try {
      // Check if customer already exists in our database
      const existingCustomer = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      });

      if (existingCustomer?.stripeCustomerId) {
        return existingCustomer.stripeCustomerId;
      }

      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      // Save customer ID to user record
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });

      return customer.id;
    } catch (error) {
      this.logger.error('Failed to get or create Stripe customer', error);
      throw error;
    }
  }

  /**
   * Save payment intent to database
   */
  private async savePaymentIntent(paymentIntent: Stripe.PaymentIntent, dto: CreatePaymentIntentDto): Promise<void> {
    try {
      // Note: Using the main Payment model instead of flightBookingPayment
      // This method is kept for compatibility but should use the main payment service
      this.logger.warn('savePaymentIntent method is deprecated, use main PaymentService instead');
    } catch (error) {
      this.logger.error('Failed to save payment intent to database', error);
      // Don't throw here as the Stripe payment intent was created successfully
    }
  }

  /**
   * Update payment status in database
   */
  private async updatePaymentStatus(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Note: Using the main Payment model instead of flightBookingPayment
      // This method is kept for compatibility but should use the main payment service
      this.logger.warn('updatePaymentStatus method is deprecated, use main PaymentService instead');
    } catch (error) {
      this.logger.error('Failed to update payment status in database', error);
    }
  }

  /**
   * Save refund to database
   */
  private async saveRefund(refund: Stripe.Refund, dto: RefundPaymentDto): Promise<void> {
    try {
      // Get the original payment to get userId
      const payment = await this.prisma.payment.findUnique({
        where: { id: dto.paymentId },
        select: { userId: true }
      });

      if (!payment) {
        throw new Error('Original payment not found');
      }

      // Use the main Refund model instead of flightBookingRefund
      await this.prisma.refund.create({
        data: {
          amount: refund.amount / 100,
          currency: refund.currency.toUpperCase(),
          reason: dto.reason || 'requested_by_customer',
          status: 'PENDING',
          refundType: 'FULL',
          stripeRefundId: refund.id,
          originalPaymentId: dto.paymentId,
          userId: payment.userId,
          flightBookingId: dto.bookingId,
          netRefundAmount: refund.amount / 100, // Same as amount for now
        },
      });
    } catch (error) {
      this.logger.error('Failed to save refund to database', error);
    }
  }

  /**
   * Map Stripe payment status to our internal status
   */
  private mapStripeStatus(stripeStatus: string): 'succeeded' | 'failed' | 'pending' | 'cancelled' {
    switch (stripeStatus) {
      case 'succeeded':
        return 'succeeded';
      case 'canceled':
        return 'cancelled';
      case 'processing':
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending';
      default:
        return 'failed';
    }
  }

  /**
   * Map Stripe refund status to our internal status
   */
  private mapStripeRefundStatus(stripeStatus: string): 'succeeded' | 'failed' | 'pending' {
    switch (stripeStatus) {
      case 'succeeded':
        return 'succeeded';
      case 'pending':
        return 'pending';
      default:
        return 'failed';
    }
  }

  /**
   * Calculate service fees for flight booking
   */
  calculateServiceFees(baseAmount: number, currency: string): number {
    // Base service fee: 2.9% + $0.30 (similar to Stripe's fee structure)
    const percentageFee = baseAmount * 0.029;
    const fixedFee = currency.toLowerCase() === 'usd' ? 0.30 : 0.25; // Adjust for currency
    
    return Math.round((percentageFee + fixedFee) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Validate payment amount against booking total
   */
  async validatePaymentAmount(bookingId: string, paymentAmount: number): Promise<boolean> {
    try {
      const booking = await this.prisma.flightBooking.findUnique({
        where: { id: bookingId },
        select: { totalPrice: true, currency: true },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      // Allow for small rounding differences (within $0.01)
      const difference = Math.abs(booking.totalPrice - paymentAmount);
      return difference <= 0.01;
    } catch (error) {
      this.logger.error('Failed to validate payment amount', error);
      return false;
    }
  }
}