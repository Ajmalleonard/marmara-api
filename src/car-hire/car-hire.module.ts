import { Module } from '@nestjs/common';
import { CarHireService } from './car-hire.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CarHireResolver } from './car-hire.resolver';

@Module({
  imports: [PrismaModule],
  providers: [CarHireService, CarHireResolver],
  exports: [CarHireService],
})
export class CarHireModule {}
