import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as path from 'path';
import { EngageAgent } from '../agent';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsAppJsService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('WhatsAppJsService');
  private client: Client | null = null;
  private ready = false;
  private instanceName = process.env.WHATSAPP_JS_INSTANCE_NAME || 'WhatsApp-web.js';
  private lastQr: string | null = null;

  constructor(private prisma: PrismaService) {}

  isReady() {
    return this.ready;
  }

  getConnectionStatus(): boolean {
    return this.ready;
  }

  async onModuleInit() {
    const authDir = path.join(process.cwd(), 'whatsappjs-auth');
    const forceQR = process.env.WHATSAPP_JS_FORCE_QR === 'true';

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: authDir }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      },
      // qrMaxRetries limits how many times QR generation is attempted
      qrMaxRetries: 5,
    });

    this.client.on('qr', (qr) => {
      this.logger.warn(`[${this.instanceName}] QR generated. Scan to authenticate.`);
      this.lastQr = qr;
      try {
        const qrcode = require('qrcode-terminal');
        console.log(`\n=== ${this.instanceName} QR ===`);
        qrcode.generate(qr, { small: true });
        console.log('========================\n');
      } catch {}
    });

    this.client.on('ready', () => {
      this.ready = true;
      this.logger.log('WhatsApp-web.js client is ready');
    });

    this.client.on('disconnected', (reason) => {
      this.ready = false;
      this.logger.warn(`WhatsApp-web.js disconnected: ${reason}`);
      // auto-reconnect
      this.client?.initialize();
    });

    this.client.on('auth_failure', (msg) => {
      this.logger.error(`Auth failure: ${msg}`);
      this.ready = false;
    });

    this.client.on('message', async (message) => {
      const chat = await message.getChat();
      if (chat.isGroup) {
        return;
      }

      if (message.fromMe) {
        return;
      }

      this.logger.log(`Received message from ${message.from}: ${message.body}`);

      const senderNumber = message.from.replace('@c.us', '');
      let fullResponse = '';

      try {
        await EngageAgent(message.body, (chunk: string) => {
          fullResponse += chunk;
        });

        if (fullResponse) {
          await this.sendMessage(senderNumber, fullResponse);
        }
      } catch (error) {
        this.logger.error(`Error engaging agent or sending message: ${error}`);
      }
    });

    if (forceQR) {
      // Clearing auth directory forces QR on next init
      try {
        const fs = require('fs');
        if (fs.existsSync(authDir)) {
          fs.rmSync(authDir, { recursive: true, force: true });
        }
      } catch (e) {
        this.logger.error(`Failed to clear auth dir: ${e}`);
      }
    }

    await this.client.initialize();
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.destroy();
      } catch {}
      this.client = null;
      this.ready = false;
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.client || !this.ready) {
      this.logger.warn('Client not ready to send message');
      return false;
    }
    try {
      const chatId = this.formatPhoneNumber(phoneNumber);
      await this.client.sendMessage(chatId, message);
      return true;
    } catch (e) {
      this.logger.error(`Failed to send message: ${e}`);
      return false;
    }
  }

  getLastQr(): string | null {
    return this.lastQr;
  }

  async forceReauth(): Promise<void> {
    const authDir = path.join(process.cwd(), 'whatsappjs-auth');
    try {
      const fs = require('fs');
      if (fs.existsSync(authDir)) {
        this.logger.warn('Force reauth requested. Clearing WhatsApp-web.js auth to regenerate QR...');
        fs.rmSync(authDir, { recursive: true, force: true });
      }
    } catch (err) {
      this.logger.error(`Failed to clear auth dir during force reauth: ${err}`);
    }
    this.ready = false;
    await this.client?.destroy().catch(() => {});
    this.client = null;
    await this.onModuleInit();
  }

  async resumeAIControl(conversationId: string): Promise<void> {
    try {
      // ? Get current conversation to preserve existing context
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      const currentContext = conversation?.context || {};

      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          context: {
            ...currentContext,
            isHumanTakeover: false,
            humanTakeoverAt: null,
            aiPausedUntil: null,
          }
        }
      });

      this.logger.log(`AI control resumed for conversation: ${conversationId}`);
    } catch (error) {
      this.logger.error(`Failed to resume AI control for conversation ${conversationId}:`, error);
      throw error;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // ?  whatsapp-web.js expects <number>@c.us for individual chats
    const digits = phoneNumber.replace(/\D/g, '');
    return `${digits}@c.us`;
  }
}