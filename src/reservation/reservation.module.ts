import { Module } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { ReservationsController } from '@/reservation/reservation.controller';
import { ReservationsService } from '@/reservation/reservation.service';
import { WhatsAppModule } from '@/whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, PrismaService],
})
export class ReservationModule {}
