import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as path from 'path';
import { EngageAgent } from '../agent';
import { PrismaService } from '../prisma/prisma.service';
import { sendSalesNotificationEmail } from '../emails/emails';

@Injectable()
export class WhatsAppJsService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('WhatsAppJsService');
  private client: Client | null = null;
  private ready = false;
  private instanceName =
    process.env.WHATSAPP_JS_INSTANCE_NAME || 'WhatsApp-web.js';
  private lastQr: string | null = null;
  private conversationMemory: Map<
    string,
    {
      userName?: string;
      clientDetails?: string; // Unified string containing all client information
      lastSeenAt?: string;
      messageCount?: number;
      askedName?: boolean;
      lastAIResponseTime?: number;
      expectingReply?: boolean;
      hasCompleteInfo?: boolean;
      lastQuestion?: string; // Track the last question asked by AI
      conversationHistory?: Array<{
        sender: 'USER' | 'AI';
        message: string;
        timestamp: Date;
        intent?: string;
      }>;
    }
  > = new Map();

  constructor(private prisma: PrismaService) {}

  // Extract probable name from free text
  private extractNameFromMessage(text: string): string | undefined {
    const t = (text || '').toLowerCase().trim();
    const patterns = [
      /^([a-zA-Z][a-zA-Z]+(?:\s+[a-zA-Z][a-zA-Z]+){0,2})$/, // Single name or name + surname
      /my name is\s+([a-zA-Z][a-zA-Z]+(?:\s+[a-zA-Z][a-zA-Z]+){0,2})/, // my name is John Doe
      /i am\s+([a-zA-Z][a-zA-Z]+(?:\s+[a-zA-Z][a-zA-Z]+){0,2})/, // i am John
      /i'm\s+([a-zA-Z][a-zA-Z]+(?:\s+[a-zA-Z][a-zA-Z]+){0,2})/, // i'm John
      /this is\s+([a-zA-Z][a-zA-Z]+(?:\s+[a-zA-Z][a-zA-Z]+){0,2})/, // this is John
      /call me\s+([a-zA-Z][a-zA-Z]+(?:\s+[a-zA-Z][a-zA-Z]+){0,2})/, // call me John
    ];
    for (const p of patterns) {
      const m = t.match(p);
      if (m && m[1]) {
        const name = m[1]
          .replace(/\bmr\.?\b|\bmrs\.?\b|\bms\.?\b|\bdr\.?\b/gi, '')
          .trim();
        return name
          .split(' ')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');
      }
    }
    return undefined;
  }

  // Extract comprehensive client details from message
  private extractClientDetails(text: string, existingDetails?: string): string {
    const t = (text || '').toLowerCase().trim();
    const details = [];
    
    // Add existing details if any
    if (existingDetails) {
      details.push(existingDetails);
    }
    
    // Service types detection
    const services = ['visa', 'ticket', 'flight', 'hotel', 'safari', 'holiday', 'tour', 'cargo', 'transfer', 'boat', 'booking', 'reservation'];
    const foundServices = services.filter(service => t.includes(service));
    if (foundServices.length > 0) {
      details.push(`Services: ${foundServices.join(', ')}`);
    }
    
    // Destinations (comprehensive list)
    const destinations = ['dubai','uae','abu dhabi','doha','qatar','saudi','riyadh','jeddah',
      'zanzibar','tanzania','kenya','nairobi','mombasa','arusha','dar es salaam','serengeti',
      'egypt','cairo','morocco','marrakech','turkey','istanbul','bali','indonesia','thailand','maldives','mauritius',
      'paris','france','london','uk','rome','italy','athens','greece','madrid','spain','singapore','new york','usa','canada'];
    
    const foundDestinations = destinations.filter(dest => t.includes(dest));
    if (foundDestinations.length > 0) {
      details.push(`Destination: ${foundDestinations.join(', ')}`);
    }
    
    // Date patterns
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/gi,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/gi
    ];
    
    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        details.push(`Date: ${matches.join(', ')}`);
        break;
      }
    }
    
    // Group size/quantity patterns
    const groupPatterns = [
      /(\d+)\s*(people|person|pax|adult|adults|passengers?|travelers?)/gi,
      /(alone|solo|just me|only me)/gi,
      /(couple|two|2\s*people)/gi,
      /(family|group)/gi,
      /(\d+)\s*(kg|kilos?|tons?|boxes?|packages?)/gi // For cargo
    ];
    
    for (const pattern of groupPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        details.push(`Quantity/Group: ${matches.join(', ')}`);
        break;
      }
    }
    
    // Departure cities
    const departureCities = ['dar es salaam', 'nairobi', 'mombasa', 'arusha', 'dodoma', 'kampala', 'kigali'];
    const foundDeparture = departureCities.filter(city => t.includes(city));
    if (foundDeparture.length > 0) {
      details.push(`From: ${foundDeparture.join(', ')}`);
    }
    
    // Contact info patterns
    const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const phonePattern = /[\+]?[\d\s\-\(\)]{10,}/g;
    
    const emails = text.match(emailPattern);
    const phones = text.match(phonePattern);
    
    if (emails) {
      details.push(`Email: ${emails.join(', ')}`);
    }
    if (phones) {
      details.push(`Phone: ${phones.join(', ')}`);
    }
    
    // Add the raw message if it contains important info not captured above
    if (t.length > 10 && !details.some(d => d.includes('Message:'))) {
      details.push(`Message: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`);
    }
    
    return details.join(' | ');
  }

  // Check if client has provided sufficient information
  private hasCompleteInformation(clientDetails: string): boolean {
    if (!clientDetails) return false;
    
    const details = clientDetails.toLowerCase();
    
    // Service-specific requirements
    if (details.includes('cargo')) {
      // Cargo services need: origin, destination, date, contact name, cargo type
      const hasOrigin = details.includes('from') || details.includes('origin:');
      const hasDestination = details.includes('to') || details.includes('destination:');
      const hasDate = details.includes('date:') || details.includes('when') || details.includes('departure');
      const hasName = details.includes('name:') || details.includes('contact:');
      const hasCargoType = details.includes('cargo type:') || details.includes('goods') || details.includes('items');
      
      return hasOrigin && hasDestination && hasDate && hasName && hasCargoType;
    }
    
    if (details.includes('visa')) {
      // Visa services need: destination country, travel date, applicant name, passport details
      const hasDestination = details.includes('destination:') || details.includes('country');
      const hasDate = details.includes('date:') || details.includes('travel date');
      const hasName = details.includes('name:') || details.includes('applicant');
      const hasPassport = details.includes('passport') || details.includes('nationality');
      
      return hasDestination && hasDate && hasName && hasPassport;
    }
    
    if (details.includes('ticket') || details.includes('flight')) {
      // Flight tickets need: origin, destination, travel date, passenger name, passenger count
      const hasOrigin = details.includes('from') || details.includes('departure city');
      const hasDestination = details.includes('to') || details.includes('destination:');
      const hasDate = details.includes('date:') || details.includes('travel date');
      const hasName = details.includes('name:') || details.includes('passenger');
      const hasCount = details.includes('passengers') || details.includes('travelers') || details.includes('quantity/group:');
      
      return hasOrigin && hasDestination && hasDate && hasName && hasCount;
    }
    
    if (details.includes('safari') || details.includes('tour')) {
      // Safari/tour packages need: destination, dates, group size, contact name, budget/preferences
      const hasDestination = details.includes('destination:') || details.includes('location');
      const hasDate = details.includes('date:') || details.includes('when');
      const hasGroupSize = details.includes('group') || details.includes('people') || details.includes('quantity/group:');
      const hasName = details.includes('name:') || details.includes('contact:');
      const hasPreferences = details.includes('budget') || details.includes('preferences') || details.includes('requirements');
      
      return hasDestination && hasDate && hasGroupSize && hasName && hasPreferences;
    }
    
    // Fallback for unknown services - require at least 4 key pieces of information
    let score = 0;
    if (details.includes('services:') || details.includes('service type')) score++;
    if (details.includes('destination:') || details.includes('location')) score++;
    if (details.includes('date:') || details.includes('when')) score++;
    if (details.includes('name:') || details.includes('contact:')) score++;
    if (details.includes('email:') || details.includes('phone:')) score++;
    if (details.includes('quantity/group:') || details.includes('people')) score++;
    
    return score >= 4;
   }

  private async updateConversationContext(
    number: string,
    patch: any,
  ): Promise<void> {
    try {
      const existing = await this.prisma.conversation.findUnique({
        where: { phoneNumber: number },
      });
      const currentContext = (existing?.context as any) || {};

      // Allowed context keys based on Prisma schema's ConversationContext
      const allowedKeys = [
        'customerType',
        'interests',
        'budget',
        'travelDates',
        'groupSize',
        'previousBookings',
        'preferences',
        'lastIntent',
        'conversationFlow',
        'isHumanTakeover',
        'humanTakeoverAt',
        'aiPausedUntil',
        'lastHumanMessage',
        'analytics',
      ];

      // Start with existing allowed context
      const baseContext: any = {};
      for (const key of allowedKeys) {
        if (key in currentContext) baseContext[key] = currentContext[key];
      }
      // Apply allowed keys from incoming patch
      for (const key of allowedKeys) {
        if (key in patch && patch[key] !== undefined) {
          baseContext[key] = patch[key];
        }
      }

      // Move custom fields into preferences JSON to satisfy schema
      const existingPrefs = baseContext.preferences || {};
      const extraPrefs: any = { ...existingPrefs };
      if (patch.needs !== undefined) extraPrefs.needs = patch.needs;
      if (patch.concerns !== undefined) extraPrefs.concerns = patch.concerns;
      if (patch.lastSeenAt !== undefined)
        extraPrefs.lastSeenAt = patch.lastSeenAt;
      if (patch.lastMessage !== undefined)
        extraPrefs.lastMessage = patch.lastMessage;
      baseContext.preferences = extraPrefs;

      const dataCommon: any = {
        context: { set: baseContext },
        lastMessageAt: new Date(),
      };
      if (patch.userName) dataCommon.customerName = patch.userName;

      if (existing) {
        await this.prisma.conversation.update({
          where: { id: existing.id },
          data: dataCommon,
        });
      } else {
        await this.prisma.conversation.create({
          data: {
            phoneNumber: number,
            status: 'ACTIVE',
            ...dataCommon,
          },
        });
      }
    } catch (e) {
      this.logger.warn(`Context upsert skipped or failed for ${number}: ${e}`);
    }
  }

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
      this.logger.warn(
        `[${this.instanceName}] QR generated. Scan to authenticate.`,
      );
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
      const name = this.extractNameFromMessage(message.body);
      const lastSeenAt = new Date().toISOString();

      const mem = this.conversationMemory.get(senderNumber) || {};
      const messageCount = (mem.messageCount || 0) + 1;
      const askedName = mem.askedName || false;
      const shouldAskName = !name && messageCount >= 3 && !askedName;

      // Check if this is a follow-up to a recent AI response (within 5 minutes)
      const now = Date.now();
      const isRecentFollowUp = mem.lastAIResponseTime && 
        (now - mem.lastAIResponseTime) < 5 * 60 * 1000; // 5 minutes

      // Extract and accumulate client details
      const newClientDetails = this.extractClientDetails(message.body, mem.clientDetails);
      const hasCompleteInfo = this.hasCompleteInformation(newClientDetails);

      // Update memory with unified approach
      const updatedMem = {
        ...mem,
        userName: name || mem.userName,
        clientDetails: newClientDetails,
        lastSeenAt,
        messageCount,
        askedName: askedName || shouldAskName,
        expectingReply: false, // Reset after receiving message
        hasCompleteInfo,
      };

      this.conversationMemory.set(senderNumber, updatedMem);
      await this.updateConversationContext(senderNumber, {
        userName: updatedMem.userName,
        clientDetails: updatedMem.clientDetails,
        lastSeenAt,
        lastMessage: message.body,
        messageCount,
        askedName: askedName || shouldAskName,
        hasCompleteInfo: updatedMem.hasCompleteInfo,
      });

      let fullResponse = '';

      try {
        // Check if user has provided all necessary information
        if (hasCompleteInfo && !mem.hasCompleteInfo) {
          // User just completed providing all info - send notification to sales team
          try {
            await sendSalesNotificationEmail(
              newClientDetails,
              senderNumber,
              updatedMem.userName
            );
            this.logger.log(`Sales notification sent for ${senderNumber}`);
          } catch (emailError) {
            this.logger.error(`Failed to send sales notification: ${emailError}`);
          }
          
          fullResponse = "Thanks so much! Our team will be back with details soon. 🌟";
        } else {
          await EngageAgent(
            message.body,
            (chunk: string) => {
              fullResponse += chunk;
            },
            name,
            isRecentFollowUp, // Pass continuity flag to agent
          );
        }

        if (shouldAskName && !hasCompleteInfo) {
          const ask =
            'May I know your name please? It helps me assist you better.';
          fullResponse = fullResponse ? `${fullResponse}\n${ask}` : ask;
        }

        if (fullResponse) {
          await this.sendMessage(senderNumber, fullResponse);
          
          // Update memory to track that we just sent a response
          const currentMem = this.conversationMemory.get(senderNumber) || {};
          this.conversationMemory.set(senderNumber, {
            ...currentMem,
            lastAIResponseTime: Date.now(),
            expectingReply: true,
          });
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
        this.logger.warn(
          'Force reauth requested. Clearing WhatsApp-web.js auth to regenerate QR...',
        );
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
        where: { id: conversationId },
      });

      const currentContext = conversation?.context || {};

      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          context: {
            set: {
              ...currentContext,
              isHumanTakeover: false,
              humanTakeoverAt: null,
              aiPausedUntil: null,
            },
          },
        },
      });

      this.logger.log(`AI control resumed for conversation: ${conversationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to resume AI control for conversation ${conversationId}:`,
        error,
      );
      throw error;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // ?  whatsapp-web.js expects <number>@c.us for individual chats
    const digits = phoneNumber.replace(/\D/g, '');
    return `${digits}@c.us`;
  }
}