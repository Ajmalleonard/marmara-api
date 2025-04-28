import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SecurityService } from './security.service';
import { SecurityResolver } from './security.resolver';

@Module({
  imports: [PrismaModule],
  providers: [SecurityService, SecurityResolver],
  exports: [SecurityService],
})
export class SecurityModule {}
