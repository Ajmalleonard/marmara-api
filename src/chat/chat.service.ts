import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PubSub } from 'graphql-subscriptions';
import { EngageHolidaysAgent } from '../holidays-agent';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private prisma: PrismaService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  async createChat(name: string, email: string) {
    this.logger.log(`prisma createChat ${name} ${email}`);
    const result = await this.prisma.chat.create({
      data: { name, email },
      include: { messages: true },
    });
    this.logger.log(`prisma createChat done ${result.id}`);
    return result;
  }

  async sendMessage(chatId: string, content: string, sender: string) {
    this.logger.log(`prisma sendMessage chatId=${chatId} sender=${sender}`);
    const result = await this.prisma.chatMessage.create({
      data: { chatId, content, sender },
    });
    this.logger.log(`prisma sendMessage done ${result.id}`);
    if (sender === 'USER') {
      this.respondWithBot(chatId, content).catch((e) => {
        this.logger.error(`bot respond error chatId=${chatId}`, e as any);
      });
    }
    return result;
  }

  async getChat(id: string) {
    this.logger.log(`prisma getChat ${id}`);
    const result = await this.prisma.chat.findUnique({
      where: { id },
      include: { messages: true },
    });
    this.logger.log(
      `prisma getChat done ${id} messages=${result?.messages?.length ?? 0}`,
    );
    return result;
  }

  private async respondWithBot(chatId: string, userMessage: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    let buffer = '';
    await EngageHolidaysAgent(
      userMessage,
      (chunk) => {
        buffer += chunk;
      },
      chat?.name ?? undefined,
      true,
    );
    const text = buffer.trim();
    if (!text) return;
    const botMsg = await this.prisma.chatMessage.create({
      data: { chatId, content: text, sender: 'BOT' },
    });
    this.logger.log(`bot respond created ${botMsg.id}`);
    await this.pubSub.publish('messageAdded', { messageAdded: botMsg, chatId });
    this.logger.log(`bot respond published ${botMsg.id}`);
  }
}
