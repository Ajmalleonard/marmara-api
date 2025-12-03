
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(name: string, email: string) {
    return this.prisma.chat.create({
      data: { name, email },
    });
  }

  async sendMessage(chatId: string, content: string, sender: string) {
    return this.prisma.chatMessage.create({
      data: { chatId, content, sender },
    });
  }

  async getChat(id: string) {
    return this.prisma.chat.findUnique({
      where: { id },
      include: { messages: true },
    });
  }
}
