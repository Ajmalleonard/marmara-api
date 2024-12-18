import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

@Module({
  controllers: [PackagesController],
  providers: [PrismaService, PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
