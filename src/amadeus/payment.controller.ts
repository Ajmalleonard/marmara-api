import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService, CreatePaymentIntentDto, ProcessPaymentDto, RefundPaymentDto } from './payment.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { PaymentProvider } from '@prisma/client';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create a payment intent for flight booking
   * POST /payment/intent
   */
  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req: any,
  ) {
    try {
      // Ensure the user ID matches the authenticated user
      createPaymentIntentDto.userId = req.user.id;
      
      return await this.paymentService.createPaymentIntent(createPaymentIntentDto);
    } catch (error) {
      this.logger.error('Failed to create payment intent', error.stack);
      throw error;
    }
  }

  /**
   * Process payment after user completes payment flow
   * POST /payment/process
   */
  @Post('process')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
    @Request() req: any,
  ) {
    try {
      // Ensure the user ID matches the authenticated user
      processPaymentDto.userId = req.user.id;
      
      return await this.paymentService.processPayment(processPaymentDto);
    } catch (error) {
      this.logger.error('Failed to process payment', error.stack);
      throw error;
    }
  }

  /**
   * Refund a payment
   * POST /payment/refund
   */
  @Post('refund')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async refundPayment(
    @Body() refundPaymentDto: RefundPaymentDto,
    @Request() req: any,
  ) {
    try {
      return await this.paymentService.refundPayment(refundPaymentDto);
    } catch (error) {
      this.logger.error('Failed to process refund', error.stack);
      throw error;
    }
  }

  /**
   * Get payment status
   * GET /payment/:paymentId/status
   */
  @Get(':paymentId/status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Param('paymentId') paymentId: string,
    @Request() req: any,
  ) {
    try {
      return await this.paymentService.getPaymentStatus(paymentId);
    } catch (error) {
      this.logger.error('Failed to get payment status', error.stack);
      throw error;
    }
  }

  /**
   * PesaPal payment callback endpoint
   * POST /payment/callback/pesapal
   */
  @Post('callback/pesapal')
  @HttpCode(HttpStatus.OK)
  async pesapalCallback(
    @Body() callbackData: any,
    @Query() queryParams: any,
  ) {
    try {
      this.logger.log('PesaPal callback received', { callbackData, queryParams });

      // Extract order tracking ID from callback
      const orderTrackingId = callbackData?.OrderTrackingId || queryParams?.OrderTrackingId;
      const orderMerchantReference = callbackData?.OrderMerchantReference || queryParams?.OrderMerchantReference;

      if (!orderTrackingId) {
        throw new BadRequestException('OrderTrackingId is required in callback');
      }

      // ! Process the callback
      const result = await this.paymentService.handlePesapalCallback({
        orderTrackingId,
        orderMerchantReference,
        callbackData,
      });

      this.logger.log('PesaPal callback processed successfully', { orderTrackingId, result });

      return {
        success: true,
        message: 'Callback processed successfully',
        orderTrackingId,
      };
    } catch (error) {
      this.logger.error('Failed to process PesaPal callback', error.stack);
      
      // ! Return success to PesaPal to avoid retries, but log the error
      return {
        success: false,
        message: 'Callback processing failed',
        error: error.message,
      };
    }
  }

  /**
   * ? PesaPal IPN (Instant Payment Notification) endpoint
   * ! GET /payment/ipn/pesapal
   */
  @Get('ipn/pesapal')
  @HttpCode(HttpStatus.OK)
  async pesapalIPN(
    @Query() queryParams: any,
  ) {
    try {
      this.logger.log('PesaPal IPN received', queryParams);

      const orderTrackingId = queryParams?.OrderTrackingId;
      const orderMerchantReference = queryParams?.OrderMerchantReference;

      if (!orderTrackingId) {
        throw new BadRequestException('OrderTrackingId is required in IPN');
      }

      // Process the IPN
      const result = await this.paymentService.handlePesapalCallback({
        orderTrackingId,
        orderMerchantReference,
        callbackData: queryParams,
      });

      this.logger.log('PesaPal IPN processed successfully', { orderTrackingId, result });

      return {
        success: true,
        message: 'IPN processed successfully',
        orderTrackingId,
      };
    } catch (error) {
      this.logger.error('Failed to process PesaPal IPN', error.stack);
      
      // Return success to PesaPal to avoid retries, but log the error
      return {
        success: false,
        message: 'IPN processing failed',
        error: error.message,
      };
    }
  }

  /**
   * Test endpoint for PesaPal payment intent creation (no auth required)
   * POST /payment/test/pesapal-intent
   */
  @Post('test/pesapal-intent')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async testPesapalIntent(
    @Body() testDto: {
      amount: number;
      currency: string;
      description?: string;
    },
  ) {
    try {
      // Test PesaPal configuration directly without database dependencies
      return await this.paymentService.testPesapalConnection(testDto);
    } catch (error) {
      this.logger.error('Failed to test PesaPal connection', error.stack);
      throw error;
    }
  }

  /**
   * Health check endpoint for payment service
   * GET /payment/health
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      service: 'payment',
      timestamp: new Date().toISOString(),
      message: 'Payment service is running (PesaPal only)',
      providers: {
        pesapal: !!(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET),
      },
    };
  }
}