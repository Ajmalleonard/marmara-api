import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VisaArrangementService } from './visa-arrangement.service';
import { VisaArrangementResolver } from './visa-arrangement.resolver';

@Module({
  imports: [PrismaModule],
  providers: [VisaArrangementService, VisaArrangementResolver],
  exports: [VisaArrangementService],
})
export class VisaArrangementModule {}
