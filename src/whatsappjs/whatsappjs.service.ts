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
  private initializing = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
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

  // Get or create conversation in database
  private async getOrCreateConversation(phoneNumber: string) {
    try {
      let conversation = await this.prisma.conversation.findUnique({
        where: { phoneNumber },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 20, // Get last 20 messages for context
          },
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            phoneNumber,
            status: 'ACTIVE',
            context: {
              customerType: 'new',
              interests: [],
              previousBookings: [],
              conversationFlow: 'greeting',
              isHumanTakeover: false,
              analytics: {},
            },
          },
          include: {
            messages: true,
          },
        });
      }

      return conversation;
    } catch (error) {
      this.logger.error(`Error getting/creating conversation: ${error}`);
      return null;
    }
  }

  // Store message in database
  private async storeMessage(
    conversationId: string,
    content: string,
    sender: 'USER' | 'AI',
    intent?: string,
    entities?: string[],
  ) {
    try {
      return await this.prisma.message.create({
        data: {
          conversationId,
          content,
          sender,
          intent,
          entities: entities || [],
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Error storing message: ${error}`);
      return null;
    }
  }

  // Build conversation history for AI context
  private buildConversationHistory(messages: any[]): string {
    if (!messages || messages.length === 0) return 'New conversation';

    return messages
      .reverse() // Show chronological order
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join('\n');
  }

  // Enhanced context-aware AI response generation
  private async generateContextAwareAIResponse(
    messageText: string,
    conversation: any,
    userName?: string,
  ): Promise<{ response: string; lastQuestion?: string }> {
    try {
      // Build conversation history for context
      const conversationHistory = this.buildConversationHistory(conversation.messages);
      
      // Get current context
      const context = conversation.context || {};
      
      // Detect intent and language
      const intent = this.detectIntent(messageText);
      const language = this.detectSwahili(messageText) ? 'sw' : 'en';

      // Create enhanced context prompt for AI
      const contextPrompt = `
CONVERSATION CONTEXT:
- Customer: ${userName || 'Unknown'}
- Phone: ${conversation.phoneNumber}
- Customer Type: ${context.customerType || 'new'}
- Conversation Flow: ${context.conversationFlow || 'greeting'}
- Previous Interests: ${context.interests?.join(', ') || 'None'}
- Language: ${language}

CONVERSATION HISTORY:
${conversationHistory}

CURRENT MESSAGE: "${messageText}"
DETECTED INTENT: ${intent}

Instructions: 
1. Maintain conversation context and remember what was discussed
2. If you asked a question previously, acknowledge the user's response appropriately
3. Use the customer's name if known: ${userName || ''}
4. Ask follow-up questions based on the conversation flow
5. Remember client details and build upon previous responses
6. For service inquiries, gather: service type, destination, dates, group size, contact details
`;

      let fullResponse = '';
      let lastQuestion = '';

      await EngageAgent(
        contextPrompt,
        (chunk: string) => {
          fullResponse += chunk;
        },
        userName,
        true, // Always treat as context-aware
      );

      // Extract the last question asked (if any) for tracking
      const questionMatch = fullResponse.match(/([^.!]*\?[^.!]*)/g);
      if (questionMatch && questionMatch.length > 0) {
        lastQuestion = questionMatch[questionMatch.length - 1].trim();
      }

      return { response: fullResponse, lastQuestion };
    } catch (error) {
      this.logger.error(`Error generating context-aware response: ${error}`);
      return { response: "I'm here to help! Could you please tell me more about what you need?" };
    }
  }

  // Detect intent from message
  private detectIntent(message: string): string {
    const text = message.toLowerCase();
    
    // Respond only to a few keywords: 'help' and greetings
    if (text.includes('help')) return 'help';
    if (text.includes('visa')) return 'visa_inquiry';
    if (text.includes('ticket') || text.includes('flight')) return 'flight_inquiry';
    if (text.includes('hotel') || text.includes('accommodation')) return 'hotel_inquiry';
    if (text.includes('safari') || text.includes('tour')) return 'tour_inquiry';
    if (text.includes('cargo') || text.includes('shipping')) return 'cargo_inquiry';
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) return 'greeting';
    if (text.includes('thank') || text.includes('bye')) return 'closing';
    
    return 'general_inquiry';
  }

  // Decide whether to auto-respond for a given intent
  private shouldRespondIntent(intent: string): boolean {
    return intent === 'greeting' || intent === 'help';
  }

  // Detect Swahili language
  private detectSwahili(message: string): boolean {
    const swahiliKeywords = [
      'habari', 'mambo', 'poa', 'sawa', 'asante', 'karibu', 'pole', 'hujambo',
      'safari', 'tembelea', 'hali', 'vizuri', 'nzuri', 'salama'
    ];
    
    const text = message.toLowerCase();
    return swahiliKeywords.some(keyword => text.includes(keyword));
  }

  // Update conversation context with new information
  private async updateConversationContextEnhanced(
    conversationId: string,
    userMessage: string,
    aiResponse: string,
    intent: string,
    userName?: string,
  ) {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) return;

      const currentContext = (conversation.context as any) || {};
      
      // Extract entities from user message
      const entities = this.extractEntitiesFromMessage(userMessage);
      
      // Update context based on conversation flow
      const updatedContext = {
        ...currentContext,
        customerType: this.determineCustomerType(currentContext.customerType, intent),
        lastIntent: intent,
        conversationFlow: this.updateConversationFlow(currentContext.conversationFlow, intent),
        interests: this.updateInterests(currentContext.interests || [], entities.destinations),
        travelDates: entities.dates.length > 0 ? entities.dates[0] : currentContext.travelDates,
        groupSize: entities.groupSize || currentContext.groupSize,
        preferences: {
          ...currentContext.preferences,
          language: this.detectSwahili(userMessage) ? 'sw' : 'en',
        },
        analytics: {
          ...currentContext.analytics,
          totalMessages: (currentContext.analytics?.totalMessages || 0) + 1,
          lastActivity: new Date(),
        },
      };

      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          customerName: userName || conversation.customerName,
          context: { set: updatedContext },
          lastMessageAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Error updating enhanced conversation context: ${error}`);
    }
  }

  // Extract entities from message
  private extractEntitiesFromMessage(message: string) {
    const text = message.toLowerCase();
    const entities = {
      destinations: [] as string[],
      dates: [] as string[],
      groupSize: null as number | null,
    };

    // Extract destinations
    const destinations = ['dubai', 'zanzibar', 'tanzania', 'kenya', 'mombasa', 'nairobi', 'arusha'];
    entities.destinations = destinations.filter(dest => text.includes(dest));

    // Extract dates
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/gi,
    ];
    
    for (const pattern of datePatterns) {
      const matches = message.match(pattern);
      if (matches) {
        entities.dates.push(...matches);
        break;
      }
    }

    // Extract group size
    const groupMatch = text.match(/(\d+)\s*(people|person|traveler|passenger)/);
    if (groupMatch) {
      entities.groupSize = parseInt(groupMatch[1]);
    }

    return entities;
  }

  // Determine customer type based on interaction
  private determineCustomerType(currentType: string, intent: string): string {
    if (currentType === 'vip') return 'vip';
    if (intent.includes('booking') || intent.includes('payment')) return 'returning';
    if (currentType === 'new' && intent !== 'greeting') return 'ongoing';
    return currentType || 'new';
  }

  // Update conversation flow
  private updateConversationFlow(currentFlow: string, intent: string): string {
    if (intent === 'greeting') return 'greeting';
    if (intent.includes('inquiry')) return 'inquiry';
    if (intent.includes('booking')) return 'negotiation';
    if (intent === 'closing') return 'closing';
    return currentFlow || 'inquiry';
  }

  // Update interests based on destinations mentioned
  private updateInterests(currentInterests: string[], newDestinations: string[]): string[] {
    const interests = [...currentInterests];
    
    newDestinations.forEach(dest => {
      if (dest.includes('safari') || dest.includes('serengeti')) {
        if (!interests.includes('safari')) interests.push('safari');
      }
      if (dest.includes('beach') || dest.includes('zanzibar')) {
        if (!interests.includes('beach')) interests.push('beach');
      }
      if (dest.includes('culture') || dest.includes('stone town')) {
        if (!interests.includes('culture')) interests.push('culture');
      }
    });

    return interests;
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

    this.client.on('disconnected', async (reason) => {
      this.ready = false;
      this.logger.warn(`WhatsApp-web.js disconnected: ${reason}`);
      // Safe reinitialize: destroy current instance and re-init with guard
      if (this.initializing) {
        this.logger.warn('Skip reinit: initialization already in progress');
        return;
      }
      this.initializing = true;
      try {
        try {
          await this.client?.destroy();
        } catch (destroyErr) {
          this.logger.warn(`WhatsApp destroy failed: ${destroyErr}`);
        }
        await this.client?.initialize();
        this.logger.log('WhatsApp client reinitialized after disconnect');
      } catch (reinitErr) {
        this.logger.error(`WhatsApp reinitialize failed: ${reinitErr}`);
        // Schedule a delayed retry to avoid tight loops
        try {
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(async () => {
              this.reconnectTimer = null;
              try {
                await this.client?.initialize();
                this.logger.log('WhatsApp client reinitialized on retry');
              } catch (retryErr) {
                this.logger.error(`WhatsApp retry reinit failed: ${retryErr}`);
              }
            }, 5000);
          }
        } catch (timerErr) {
          this.logger.error(`Failed to schedule reconnect: ${timerErr}`);
        }
      } finally {
        this.initializing = false;
      }
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

      try {
        // Get or create conversation in database
        const conversation = await this.getOrCreateConversation(senderNumber);
        if (!conversation) {
          this.logger.error(
            `Failed to get/create conversation for ${senderNumber}`,
          );
          return;
        }

        // Detect intent and extract entities
        const intent = this.detectIntent(message.body);
        const entities = this.extractEntitiesFromMessage(message.body);

        // Only respond to 'greeting' or 'help' intents
        if (!this.shouldRespondIntent(intent)) {
          this.logger.debug(
            `Skipping auto-reply for intent '${intent}' from ${senderNumber}`,
          );
          return;
        }

        // Store user message in database (only for greeting/help)
        await this.storeMessage(
          conversation.id,
          message.body,
          'USER',
          intent,
          entities.destinations,
        );

        // Update in-memory conversation tracking
        const mem = this.conversationMemory.get(senderNumber) || {};
        const messageCount = (mem.messageCount || 0) + 1;
        const askedName = mem.askedName || false;
        const shouldAskName = !name && messageCount >= 3 && !askedName;

        // Add to conversation history
        const conversationHistory = mem.conversationHistory || [];
        conversationHistory.push({
          sender: 'USER',
          message: message.body,
          timestamp: new Date(),
          intent,
        });

        // Keep only last 10 messages in memory for performance
        if (conversationHistory.length > 10) {
          conversationHistory.shift();
        }

        // Extract and accumulate client details
        const newClientDetails = this.extractClientDetails(
          message.body,
          mem.clientDetails,
        );
        const hasCompleteInfo = this.hasCompleteInformation(newClientDetails);

        let fullResponse = '';
        let lastQuestion = '';

        // Check if user has provided all necessary information
        this.logger.debug(
          `Complete info check for ${senderNumber}: hasCompleteInfo=${hasCompleteInfo}, mem.hasCompleteInfo=${mem.hasCompleteInfo}`,
        );
        this.logger.debug(
          `Client details for ${senderNumber}: ${newClientDetails}`,
        );

        if (hasCompleteInfo && !mem.hasCompleteInfo) {
          // User just completed providing all info - send notification to sales team
          this.logger.log(
            `🎯 Complete information detected for ${senderNumber}! Sending sales notification...`,
          );
          this.logger.debug(
            `Sales notification details - Phone: ${senderNumber}, Name: ${name || mem.userName}, Details: ${newClientDetails}`,
          );

          try {
            await sendSalesNotificationEmail(
              newClientDetails,
              senderNumber,
              name || mem.userName,
            );
            this.logger.log(
              `✅ Sales notification sent successfully for ${senderNumber}`,
            );
          } catch (emailError) {
            this.logger.error(
              `❌ Failed to send sales notification for ${senderNumber}: ${emailError}`,
            );
          }

          fullResponse =
            'Thanks so much! Our team will be back with details soon. 🌟';
        } else {
          // Generate context-aware AI response using conversation history
          const aiResponse = await this.generateContextAwareAIResponse(
            message.body,
            conversation,
            name || mem.userName,
          );
          fullResponse = aiResponse.response;
          lastQuestion = aiResponse.lastQuestion || '';
        }

        if (shouldAskName && !hasCompleteInfo) {
          const ask =
            'May I know your name please? It helps me assist you better.';
          fullResponse = fullResponse ? `${fullResponse}\n${ask}` : ask;
        }

        if (fullResponse) {
          // Send response to user
          await this.sendMessage(senderNumber, fullResponse);

          // Store AI response in database
          await this.storeMessage(conversation.id, fullResponse, 'AI', intent);

          // Add AI response to conversation history
          conversationHistory.push({
            sender: 'AI',
            message: fullResponse,
            timestamp: new Date(),
            intent,
          });

          // Update enhanced conversation context in database
          await this.updateConversationContextEnhanced(
            conversation.id,
            message.body,
            fullResponse,
            intent,
            name || mem.userName,
          );

          // Update in-memory conversation tracking
          const updatedMem = {
            ...mem,
            userName: name || mem.userName,
            clientDetails: newClientDetails,
            lastSeenAt,
            messageCount,
            askedName: askedName || shouldAskName,
            lastAIResponseTime: Date.now(),
            expectingReply: true,
            hasCompleteInfo,
            lastQuestion, // Track the last question asked
            conversationHistory,
          };

          this.conversationMemory.set(senderNumber, updatedMem);

          // Also update the legacy context system for backward compatibility
          await this.updateConversationContext(senderNumber, {
            userName: updatedMem.userName,
            clientDetails: updatedMem.clientDetails,
            lastSeenAt,
            lastMessage: message.body,
            messageCount,
            askedName: askedName || shouldAskName,
            hasCompleteInfo: updatedMem.hasCompleteInfo,
          });
        }
      } catch (error) {
        this.logger.error(`Error processing message from ${senderNumber}: ${error}`);
        
        // Fallback response in case of error
        try {
          await this.sendMessage(senderNumber, "I'm sorry, I encountered an issue. Please try again or contact our support team.");
        } catch (fallbackError) {
          this.logger.error(`Failed to send fallback message: ${fallbackError}`);
        }
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

    try {
      this.initializing = true;
      await this.client.initialize();
    } catch (e) {
      this.logger.error(
        `WhatsApp initialization failed: ${e instanceof Error ? e.message : e}`,
      );
      // Schedule retry without crashing the app
      try {
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;
            try {
              await this.client?.initialize();
              this.logger.log('WhatsApp client initialized on retry');
            } catch (retryErr) {
              this.logger.error(`WhatsApp retry initialization failed: ${retryErr}`);
            }
          }, 5000);
        }
      } catch (timerErr) {
        this.logger.error(`Failed to schedule WhatsApp init retry: ${timerErr}`);
      }
    } finally {
      this.initializing = false;
    }
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