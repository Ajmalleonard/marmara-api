import { Module } from '@nestjs/common';
import { CarHireService } from './car-hire.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CarHireResolver } from './car-hire.resolver';
import { CarHireController } from './car-hire.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CarHireController],
  providers: [CarHireService, CarHireResolver],
  exports: [CarHireService],
})
export class CarHireModule {}
