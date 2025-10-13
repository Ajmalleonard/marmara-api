import { Module } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';
import { AmadeusController } from './amadeus.controller';
import { AmadeusResolver } from './amadeus.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { PassengerValidationService } from './services/passenger-validation.service';
import { FlightValidationService } from './services/flight-validation.service';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ReferenceDataService } from './reference-data.service';

@Module({
  imports: [PrismaModule],
  controllers: [AmadeusController, PaymentController],
  providers: [
    AmadeusService,
    AmadeusResolver,
    PassengerValidationService,
    FlightValidationService,
    PaymentService,
    ReferenceDataService,
  ],
  exports: [AmadeusService, PaymentService, ReferenceDataService],
})
export class AmadeusModule {}