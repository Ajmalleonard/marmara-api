import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
    });
    this.$on('query', (e: any) => {
      this.logger.debug(`query ${e.query} params=${e.params} duration=${e.duration}ms`);
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
