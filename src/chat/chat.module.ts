
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [PrismaModule],
  providers: [
    ChatService,
    ChatResolver,
    { provide: 'PUB_SUB', useValue: new PubSub() },
  ],
})
export class ChatModule {}
