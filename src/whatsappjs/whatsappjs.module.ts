import { Module } from '@nestjs/common';
import { WhatsAppJsService } from './whatsappjs.service';
import { WhatsAppJsController } from './whatsappjs.controller';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppJsController],
  providers: [WhatsAppJsService],
  exports: [WhatsAppJsService],
})
export class WhatsAppJsModule {}