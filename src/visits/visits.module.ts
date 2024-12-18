import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';

@Module({
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
