import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import makeWASocket, { 
  ConnectionState, 
  DisconnectReason, 
  useMultiFileAuthState,
  WAMessage,
  proto,
  WASocket
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import * as qrcode from 'qrcode-terminal';
import { EngageAgent } from '../agent';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private socket: any;
  private isConnected = false;
  private readonly authDir = path.join(process.cwd(), 'whatsapp-auth');
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isReconnecting = false;

  constructor(private prisma: PrismaService) {}
  private recentNotifications = new Map<string, number>();
  private readonly NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown per phone number

  // Store user contacts for personalization
  private userContacts = new Map<string, { name?: string, lastSeen: number }>();

  async onModuleInit() {
    await this.initializeWhatsApp();
  }

  private async initializeWhatsApp() {
    try {
      // Clear any existing reconnection timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Optionally force QR regeneration in prod by clearing persisted auth
      if (process.env.WHATSAPP_FORCE_QR === 'true') {
        try {
          if (fs.existsSync(this.authDir)) {
            this.logger.warn('WHATSAPP_FORCE_QR=true detected. Clearing persisted WhatsApp auth to regenerate QR.');
            fs.rmSync(this.authDir, { recursive: true, force: true });
          }
        } catch (err) {
          this.logger.error('Failed to clear WhatsApp auth directory during forced QR:', err);
        }
      }

      //  ! Ensure auth directory exists
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

      this.socket = makeWASocket({
        auth: state,
        logger: {
          level: 'silent',
          child: () => ({
            level: 'silent',
            trace: () => {},
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
            fatal: () => {}
          }),
          trace: () => {},
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
          fatal: () => {}
        } as any,
      });

      this.socket.ev.on('connection.update', (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log('QR Code generated. Please scan with WhatsApp.');
          console.log('\n=== WhatsApp QR Code ===');
          qrcode.generate(qr, { small: true });
          console.log('========================\n');
          console.log('Please scan the QR code above with your WhatsApp mobile app to connect.');
        }

        if (connection === 'close') {
          this.isConnected = false;
          this.handleConnectionClose(lastDisconnect);
        } else if (connection === 'open') {
          this.logger.log('WhatsApp connection opened successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          this.isReconnecting = false;
        }
      });

      this.socket.ev.on('creds.update', saveCreds);

      // Listen for incoming messages with error handling
      this.socket.ev.on('messages.upsert', async (m: any) => {
        try {
          const messages = m.messages;
          
          for (const message of messages) {
            // Only process messages that are not from us and are actual text messages
            if (!message.key.fromMe && message.message?.conversation) {
              await this.handleIncomingMessage(message);
            }
          }
        } catch (error) {
          this.logger.error('Error processing incoming message:', error);
          // Don't let message processing errors crash the application
        }
      });

    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp:', error);
      this.scheduleReconnect();
    }
  }

  private handleConnectionClose(lastDisconnect: any) {
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
    const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
    const shouldReconnect = !isLoggedOut;

    this.logger.warn(`Connection closed. Status: ${statusCode}, Should reconnect: ${shouldReconnect}`);

    if (isLoggedOut) {
      // Clear persisted auth state so that QR is generated on next init
      try {
        if (fs.existsSync(this.authDir)) {
          this.logger.warn('Detected logged out/401. Clearing WhatsApp auth and regenerating QR...');
          fs.rmSync(this.authDir, { recursive: true, force: true });
        }
      } catch (err) {
        this.logger.error('Failed to clear WhatsApp auth directory after logout:', err);
      }
      // Immediately reinitialize to trigger fresh QR
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      this.initializeWhatsApp();
      return;
    }

    if (shouldReconnect && !this.isReconnecting) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection attempts.`);
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    // Exponential backoff: 3s, 6s, 12s, 24s, etc. (max 60s)
    const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), 60000);
    
    this.logger.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.initializeWhatsApp();
      } catch (error) {
        this.logger.error('Reconnection attempt failed:', error);
        this.isReconnecting = false;
        this.scheduleReconnect();
      }
    }, delay);
  }

  async sendMessage(phoneNumber: string, message: string, retryCount: number = 0): Promise<boolean> {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    
    try {
      if (!this.isConnected) {
        this.logger.warn('WhatsApp is not connected. Message not sent.');
        return false;
      }

      // Format phone number (remove any non-digits and add country code if needed)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const jid = `${formattedNumber}@s.whatsapp.net`;

      // Add timeout to the sendMessage operation
      const sendPromise = this.socket.sendMessage(jid, { text: message });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Message send timeout')), 10000) // 10 second timeout
      );

      await Promise.race([sendPromise, timeoutPromise]);
      this.logger.log(`Message sent successfully to ${phoneNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to ${phoneNumber} (attempt ${retryCount + 1}):`, error);
      
      // Check if it's a connection error
      if (error.message?.includes('Connection Closed') || error.output?.statusCode === 428) {
        this.logger.warn('Connection closed during message send. Triggering reconnection.');
        this.isConnected = false;
        this.scheduleReconnect();
        return false;
      }
      
      // Retry logic for timeout errors and other recoverable errors
      if (retryCount < maxRetries && (error.message?.includes('Timed Out') || error.message?.includes('timeout'))) {
        this.logger.log(`Retrying message send to ${phoneNumber} in ${retryDelay}ms...`);
        await this.delay(retryDelay);
        return this.sendMessage(phoneNumber, message, retryCount + 1);
      }
      
      return false;
    }
  }

  async sendTripPlanNotification(customerPhone: string, customerName: string, destination: string): Promise<void> {
    const customerMessage = `🌟 Hello ${customerName}! 

Thank you for submitting your trip plan to ${destination}! 

Our travel experts are reviewing your requirements and will get back to you shortly with a customized itinerary.

We're excited to help make your dream trip a reality! ✈️

Best regards,
Marmara Travel Team`;

    await this.sendMessage(customerPhone, customerMessage);
  }

  async sendAdminNotification(customerName: string, destination: string, customerPhone: string): Promise<void> {
    // Spam prevention: Check if this phone number has sent a notification recently
    const now = Date.now();
    const lastNotification = this.recentNotifications.get(customerPhone);
    
    if (lastNotification && (now - lastNotification) < this.NOTIFICATION_COOLDOWN) {
      this.logger.warn(`Notification blocked for ${customerPhone} - cooldown period active`);
      return;
    }

    // You can configure admin phone numbers in environment variables
    const adminPhones = process.env.ADMIN_WHATSAPP_NUMBERS?.split(',') || [];

    if (adminPhones.length === 0) {
      this.logger.warn('No admin phone numbers configured in ADMIN_WHATSAPP_NUMBERS');
      return;
    }

    const adminMessage = `🔔 New Trip Plan Submission

Customer: ${customerName}
Destination: ${destination}
Phone: ${customerPhone}

Please review and respond to the customer's trip plan request.`;

    // Record this notification to prevent spam
    this.recentNotifications.set(customerPhone, now);
    
    // Clean up old entries (older than 1 hour)
    for (const [phone, timestamp] of this.recentNotifications.entries()) {
      if (now - timestamp > 60 * 60 * 1000) { // 1 hour
        this.recentNotifications.delete(phone);
      }
    }

    for (const adminPhone of adminPhones) {
      if (adminPhone.trim()) {
        await this.sendMessage(adminPhone.trim(), adminMessage);
      }
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume it's Turkish (+90)
    if (!cleaned.startsWith('90') && cleaned.length === 10) {
      cleaned = '90' + cleaned;
    }
    
    return cleaned;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  private async handleIncomingMessage(message: WAMessage): Promise<void> {
    try {
      const messageText = message.message?.conversation || 
                         message.message?.extendedTextMessage?.text || '';
      const senderNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '') || '';
      const remoteJid = message.key.remoteJid || '';
      
      // Skip if no message text or if it's from us
      if (!messageText || message.key.fromMe) {
        return;
      }

      // Skip newsletter, broadcast, group, and status messages
      if (this.shouldSkipMessage(remoteJid, senderNumber)) {
        this.logger.log(`Skipping non-personal message from ${remoteJid}`);
        return;
      }

      // Skip if message is too short or seems like spam
      if (messageText.length < 2 || messageText.length > 1000) {
        this.logger.warn(`Skipping message: inappropriate length (${messageText.length} chars)`);
        return;
      }

      // Check for spam patterns
      if (this.isSpamMessage(messageText)) {
        this.logger.warn(`Skipping potential spam message from ${senderNumber}`);
        return;
      }

      this.logger.log(`Received message from ${senderNumber}: ${messageText}`);
      
      // Filter messages - only respond to greetings and help-related messages
      if (!this.shouldRespondToMessage(messageText)) {
        this.logger.log(`Skipping message - not a greeting or help request: ${messageText}`);
        return;
      }
      
      // Get or create conversation context
      const conversation = await this.getOrCreateConversation(senderNumber);
      
      // Check for human takeover detection
      const isHumanTakeover = await this.detectHumanTakeover(messageText, senderNumber);
      
      // Check if AI should be paused
      const shouldAIPause = await this.shouldAIPause(conversation);
      
      // Store user message
      const userMessage = await this.storeMessage(
        conversation.id,
        messageText,
        'USER',
      );
      
      // Update user contact information
      await this.updateUserContact(senderNumber, messageText);
      
      // If human has taken over or AI should be paused, don't generate AI response
      if (isHumanTakeover || shouldAIPause) {
        if (isHumanTakeover) {
          await this.handleHumanTakeover(conversation.id, senderNumber);
        }
        return;
      }
      
      // Show typing indicator
      await this.showTypingIndicator(senderNumber);
      
      // Generate context-aware AI response
      const startTime = Date.now();
      const aiResponse = await this.generateContextAwareAIResponse(messageText, conversation);
      const responseTime = Date.now() - startTime;
      
      if (aiResponse) {
        // Store AI response
        await this.storeMessage(conversation.id, aiResponse, 'AI');
        
        // Calculate realistic typing delay
        const delay = this.calculateTypingDelay(aiResponse);
        await this.delay(delay);
        
        // Send response with error handling
        const messageSent = await this.sendMessage(senderNumber, aiResponse);
        
        if (messageSent) {
          // Track metrics only if message was sent successfully
          await this.trackEngagementMetrics(conversation.id, messageText, this.detectIntent(messageText));
          await this.trackResponseMetrics(conversation.id, aiResponse, responseTime);
          await this.updateConversationContext(conversation.id, messageText, aiResponse);
        } else {
          // Track error metrics if message failed to send
          await this.trackErrorMetrics(conversation.id, 'Failed to send AI response');
        }
      }
      } catch (error) {
        this.logger.error('Error in handleIncomingMessage:', error);
        
        // Check if it's a connection error
        if (error.message?.includes('Connection Closed') || error.output?.statusCode === 428) {
          this.logger.warn('Connection closed during message handling. Triggering reconnection.');
          this.isConnected = false;
          this.scheduleReconnect();
        }
        
        // Don't let message handling errors crash the application
        // The error is logged but the application continues running
      }
  }

  private shouldSkipMessage(remoteJid: string, senderNumber: string): boolean {
    // Skip newsletter messages (contain @newsletter)
    if (remoteJid.includes('@newsletter')) {
      return true;
    }
    
    // Skip broadcast messages (contain @broadcast)
    if (remoteJid.includes('@broadcast')) {
      return true;
    }
    
    // Skip group messages (contain @g.us)
    if (remoteJid.includes('@g.us')) {
      return true;
    }
    
    // Skip status messages (contain @status)
    if (remoteJid.includes('@status')) {
      return true;
    }
    
    // Skip if sender number is empty or invalid
    if (!senderNumber || senderNumber.length < 10) {
      return true;
    }
    
    return false;
  }

  private isSpamMessage(message: string): boolean {
    const spamPatterns = [
      /(.)\1{4,}/g, // Repeated characters (5+ times)
      /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/g, // Only special characters
      /(free|win|winner|congratulations|prize|lottery|million|dollars|urgent|act now)/gi,
      /^(test|testing|hello){3,}$/gi, // Repeated test messages
    ];
    
    return spamPatterns.some(pattern => pattern.test(message));
  }

  private shouldRespondToMessage(messageText: string): boolean {
    const lowerMessage = messageText.toLowerCase();
    
    // Greeting patterns (English and Swahili)
    const greetingPatterns = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'habari', 'hujambo', 'mambo', 'salamu', 'shikamoo', 'karibu'
    ];
    
    // Help/assistance patterns
    const helpPatterns = [
      'help', 'assist', 'support', 'information', 'info', 'question',
      'msaada', 'kusaidia', 'maelezo', 'swali', 'habari', 'taarifa'
    ];
    
    // Travel/service related patterns (expanded)
    const servicePatterns = [
      // Core travel services
      'travel', 'trip', 'safari', 'booking', 'reservation', 'hotel', 'hotels', 'flight', 'flights',
      'visa', 'package', 'tour', 'destination', 'plan', 'price', 'cost', 'ticket', 'tickets',
      // Logistics and global services
      'logistics', 'cargo', 'shipping', 'freight', 'delivery', 'courier', 'from dubai', 'dubai', 'uae',
      // Swahili equivalents
      'utalii', 'ndege', 'hoteli', 'tiketi', 'bei', 'gharama', 'mpango', 'mahali', 'usafirishaji'
    ];
    
    // Irrelevant chit-chat patterns (to reduce non-context responses)
    const chitChatPatterns = [
      'weather', 'football', 'soccer', 'game', 'music', 'song', 'movie', 'news', 'politics',
      'lol', 'haha', 'hahaha', 'bro', 'dude', 'what\'s up', 'wyd'
    ];
    
    const hasGreeting = greetingPatterns.some(pattern => lowerMessage.includes(pattern));
    const hasHelpRequest = helpPatterns.some(pattern => lowerMessage.includes(pattern));
    const hasServiceInquiry = servicePatterns.some(pattern => lowerMessage.includes(pattern));
    const isChitChat = chitChatPatterns.some(pattern => lowerMessage.includes(pattern));
    
    // Respond only if: greeting OR help OR service inquiry
    // Ignore pure chit-chat unless accompanied by a service/greeting/help context
    if (hasGreeting || hasHelpRequest || hasServiceInquiry) {
      return true;
    }
    
    return false;
  }

  private async generateAIResponse(messageText: string, senderNumber: string): Promise<string | null> {
    try {
      // Get user info for personalization
      const userInfo = this.userContacts.get(senderNumber);
      const userName = userInfo?.name;
      
      // Use Groq AI for intelligent responses with personalized greeting
      let fullResponse = '';
      
      await EngageAgent(messageText, (chunk: string) => {
        fullResponse += chunk;
      }, userName);
      
      return fullResponse || 'Thank you for your message. Our team will get back to you soon!';
      
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      
      // Fallback to simple responses if Groq fails
      const userInfo = this.userContacts.get(senderNumber);
      const userName = userInfo?.name;
      const lowerMessage = messageText.toLowerCase();
      
      // Detect language for fallback responses
      const isSwahili = this.detectSwahili(messageText);
      
      if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('safari')) {
        const greeting = userName ? 
          (isSwahili ? `Hujambo ${userName}! 🌍` : `Hi ${userName}! 🌍`) : 
          (isSwahili ? '🌍 Hujambo!' : '🌍 Hi there!');
        return isSwahili ? 
          `${greeting} Nitafurahi kukusaidia kupanga safari yako! Tembelea tovuti yetu au niambie zaidi kuhusu mahali unapotaka kwenda.` :
          `${greeting} I'd be happy to help you plan your trip! You can visit our website to create a custom travel plan, or tell me more about where you'd like to go.`;
      }
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('habari') || lowerMessage.includes('hujambo')) {
        const greeting = userName ? 
          (isSwahili ? `👋 Habari ${userName}!` : `👋 Hello ${userName}!`) : 
          (isSwahili ? '👋 Habari!' : '👋 Hello!');
        return isSwahili ?
          `${greeting} Karibu Marmara Travel. Nitakusaidiaje kupanga adventure yako ya kesho?` :
          `${greeting} Welcome to Marmara Travel. How can I help you plan your next adventure today?`;
      }
      
      // Default fallback
      const greeting = userName ? 
        (isSwahili ? `Asante kwa ujumbe wako, ${userName}! 🙏` : `Thank you for your message, ${userName}! 🙏`) : 
        (isSwahili ? 'Asante kwa ujumbe wako! 🙏' : 'Thank you for your message! 🙏');
      
      return isSwahili ?
        `${greeting}\n\nNaitwa Sara kutoka Marmara Travel . Nawaze kukusaidia na utaatibu wa Safari,Tickets Za Ndege, Hotels na  Package za kutalii maeneo mbali mbali, Pia Kusafirisha huduma kutoka Dubai kwenda mahali popote duniani. Unahitaji msaada gani leo?` :
        `${greeting}\n\nI'm Marmara Travel's assistant. I can help you with travel planning, destinations, and bookings. How can I help you today?`;
    }
  }

  private detectSwahili(message: string): boolean {
    const swahiliKeywords = [
      'habari', 'hujambo', 'mambo', 'poa', 'sawa', 'asante', 'karibu', 'safari', 
      'utalii', 'ndege', 'hoteli', 'visa', 'bei', 'gharama', 'msaada', 'haya',
      'ndiyo', 'hapana', 'pole', 'baadaye', 'kesho', 'leo', 'jana', 'wiki',
      'mwezi', 'mwaka', 'siku', 'muda', 'haraka', 'polepole', 'vizuri', 'mbaya'
    ];
    
    const lowerMessage = message.toLowerCase();
    return swahiliKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async updateUserContact(phoneNumber: string, messageText: string): Promise<void> {
    try {
      const now = Date.now();
      let userInfo = this.userContacts.get(phoneNumber) || { lastSeen: now };
      
      // Simple name detection from common patterns
      const namePatterns = [
        /my name is (\w+)/i,
        /i'm (\w+)/i,
        /i am (\w+)/i,
        /call me (\w+)/i,
        /this is (\w+)/i,
      ];
      
      for (const pattern of namePatterns) {
        const match = messageText.match(pattern);
        if (match && match[1]) {
          userInfo.name = match[1];
          this.logger.log(`Detected name for ${phoneNumber}: ${match[1]}`);
          break;
        }
      }
      
      userInfo.lastSeen = now;
      this.userContacts.set(phoneNumber, userInfo);
      
      // Clean up old contacts (older than 30 days)
      for (const [phone, info] of this.userContacts.entries()) {
        if (now - info.lastSeen > 30 * 24 * 60 * 60 * 1000) { // 30 days
          this.userContacts.delete(phone);
        }
      }
    } catch (error) {
      this.logger.error('Error updating user contact:', error);
    }
  }

  private async showTypingIndicator(phoneNumber: string): Promise<void> {
    try {
      if (this.socket && this.isConnected) {
        await this.socket.sendPresenceUpdate('composing', phoneNumber + '@s.whatsapp.net');
      }
    } catch (error) {
      this.logger.error('Error showing typing indicator:', error);
    }
  }

  private calculateTypingDelay(message: string): number {
    // Simulate realistic typing speed: ~40 words per minute
    const words = message.split(' ').length;
    const baseDelay = Math.max(1000, words * 150); // Minimum 1 second, ~150ms per word
    const randomVariation = Math.random() * 1000; // Add some randomness
    return Math.min(baseDelay + randomVariation, 8000); // Maximum 8 seconds
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Context Management Methods
  private async getOrCreateConversation(phoneNumber: string) {
    try {
      let conversation = await this.prisma.conversation.findFirst({
        where: { phoneNumber },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 20 // Last 20 messages for context
          }
        }
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            phoneNumber,
            status: 'ACTIVE',
            context: {}
          },
          include: {
            messages: true
          }
        });
        this.logger.log(`Created new conversation for ${phoneNumber}`);
      }

      return conversation;
    } catch (error) {
      this.logger.error('Error getting/creating conversation:', error);
      throw error;
    }
  }

  private async storeMessage(
    conversationId: string,
    content: string,
    sender: 'USER' | 'AI',
    messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' = 'TEXT'
  ) {
    try {
      const message = await this.prisma.message.create({
        data: {
          conversationId,
          content,
          sender,
          messageType
        }
      });

      return message;
    } catch (error) {
      this.logger.error('Error storing message:', error);
      throw error;
    }
  }

  private async generateContextAwareAIResponse(messageText: string, conversation: any): Promise<string | null> {
    try {
      // Get user info for personalization
      const userInfo = this.userContacts.get(conversation.phoneNumber);
      const userName = userInfo?.name;
      
      // Build conversation history for context
      const conversationHistory = this.buildConversationHistory(conversation.messages);
      
      // Detect language and intent
      const language = this.detectSwahili(messageText) ? 'sw' : 'en';
      const intent = this.detectIntent(messageText);
      
      // Track engagement metrics
      await this.trackEngagementMetrics(conversation.id, messageText, intent);
      
      // Create context-aware prompt
      const contextPrompt = this.buildContextPrompt(
        messageText, 
        conversationHistory, 
        userName, 
        language, 
        intent,
        conversation.context
      );
      
      // Use Groq AI for intelligent responses with personalized greeting
      let fullResponse = '';
      
      await EngageAgent(contextPrompt, (chunk: string) => {
        fullResponse += chunk;
      }, userName);
      
      if (fullResponse) {
        // Track successful AI response
        await this.trackResponseMetrics(conversation.id, fullResponse, Date.now());
        return fullResponse;
      }
      
      return this.getFallbackResponse(language, intent);
      
    } catch (error) {
      this.logger.error('Error generating context-aware AI response:', error);
      
      // Track error metrics
      await this.trackErrorMetrics(conversation.id, error.message);
      
      // Fallback to simple response
      const language = this.detectSwahili(messageText) ? 'sw' : 'en';
      const intent = this.detectIntent(messageText);
      return this.getFallbackResponse(language, intent);
    }
  }

  private async trackEngagementMetrics(conversationId: string, message: string, intent: string): Promise<void> {
    try {
      // Check if this is a plan-related request
      const isPlanRelated = this.isPlanRelatedMessage(message, intent);
      
      if (isPlanRelated) {
        await this.trackPlannerEngagement(conversationId, message, intent);
      } else {
        await this.trackGeneralWhatsAppEngagement(conversationId, message, intent);
      }
      
    } catch (error) {
      this.logger.error('Error tracking engagement metrics:', error);
    }
  }

  private async trackPlannerEngagement(conversationId: string, message: string, intent: string): Promise<void> {
    try {
      // Find or create planner engagement record
      let plannerEngagement = await this.prisma.plannerEngagement.findFirst({
        where: { conversationId }
      });

      if (!plannerEngagement) {
        plannerEngagement = await this.prisma.plannerEngagement.create({
          data: {
            conversationId,
            planRequested: this.isPlanRequest(message, intent),
            planType: this.determinePlanType(message, intent),
            planData: {
              originalRequest: message,
              intent: intent,
              timestamp: new Date()
            }
          }
        });
      } else {
        // Update existing engagement
        const updates: any = {};
        
        if (this.isPlanRequest(message, intent)) {
          updates.planRequested = true;
        }
        
        if (this.isPlanAcceptance(message)) {
          updates.planAccepted = true;
        }
        
        if (this.isPlanModification(message)) {
          updates.planModified = true;
        }
        
        if (Object.keys(updates).length > 0) {
          await this.prisma.plannerEngagement.update({
            where: { id: plannerEngagement.id },
            data: {
              ...updates,
              planData: {
                ...plannerEngagement.planData as any,
                lastUpdate: new Date(),
                lastMessage: message
              }
            }
          });
        }
      }

      // Send notification only for planner activities
      if (this.isPlanRequest(message, intent) && !plannerEngagement.notificationSent) {
        await this.sendPlannerNotification(conversationId, plannerEngagement.id);
      }

    } catch (error) {
      this.logger.error('Error tracking planner engagement:', error);
    }
  }

  private async trackGeneralWhatsAppEngagement(conversationId: string, message: string, intent: string): Promise<void> {
    try {
      // Find or create general WhatsApp engagement record
      let whatsappEngagement = await this.prisma.whatsAppEngagement.findFirst({
        where: { conversationId, isActive: true }
      });

      if (!whatsappEngagement) {
        whatsappEngagement = await this.prisma.whatsAppEngagement.create({
          data: {
            conversationId,
            messageCount: 1,
            interactionType: this.determineInteractionType(intent),
            analytics: {
              firstMessage: message,
              firstIntent: intent,
              sessionStart: new Date()
            }
          }
        });
      } else {
        // Update existing engagement
        const sessionDuration = (Date.now() - whatsappEngagement.createdAt.getTime()) / (1000 * 60); // in minutes
        
        await this.prisma.whatsAppEngagement.update({
          where: { id: whatsappEngagement.id },
          data: {
            messageCount: whatsappEngagement.messageCount + 1,
            sessionDuration: sessionDuration,
            lastActivity: new Date(),
            analytics: {
              ...whatsappEngagement.analytics as any,
              lastMessage: message,
              lastIntent: intent,
              totalInteractions: whatsappEngagement.messageCount + 1
            }
          }
        });
      }

    } catch (error) {
      this.logger.error('Error tracking general WhatsApp engagement:', error);
    }
  }

  private async sendPlannerNotification(conversationId: string, plannerEngagementId: string): Promise<void> {
    try {
      // Update notification status
      await this.prisma.plannerEngagement.update({
        where: { id: plannerEngagementId },
        data: {
          notificationSent: true,
          notificationTime: new Date()
        }
      });

      this.logger.log(`Planner notification sent for conversation: ${conversationId}`);
      
    } catch (error) {
      this.logger.error('Error sending planner notification:', error);
    }
  }

  // Helper methods for plan detection
  private isPlanRelatedMessage(message: string, intent: string): boolean {
    const planKeywords = ['plan', 'itinerary', 'schedule', 'trip', 'tour', 'booking', 'reserve'];
    const planIntents = ['travel_planning', 'itinerary_request', 'booking_inquiry'];
    
    const messageContainsPlanKeywords = planKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    const intentIsPlanRelated = planIntents.includes(intent);
    
    return messageContainsPlanKeywords || intentIsPlanRelated;
  }

  private isPlanRequest(message: string, intent: string): boolean {
    const requestKeywords = ['create', 'make', 'plan', 'suggest', 'recommend', 'book'];
    return requestKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
           intent === 'travel_planning' || intent === 'itinerary_request';
  }

  private isPlanAcceptance(message: string): boolean {
    const acceptanceKeywords = ['yes', 'accept', 'ok', 'good', 'perfect', 'book it', 'confirm'];
    return acceptanceKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isPlanModification(message: string): boolean {
    const modificationKeywords = ['change', 'modify', 'different', 'instead', 'but', 'however'];
    return modificationKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private determinePlanType(message: string, intent: string): string {
    if (message.toLowerCase().includes('safari') || intent === 'safari_inquiry') return 'safari';
    if (message.toLowerCase().includes('hotel') || intent === 'accommodation') return 'accommodation';
    if (message.toLowerCase().includes('transport') || intent === 'transport') return 'transport';
    if (message.toLowerCase().includes('itinerary')) return 'itinerary';
    return 'general_travel';
  }

  private determineInteractionType(intent: string): string {
    if (intent.includes('inquiry')) return 'inquiry';
    if (intent.includes('booking')) return 'booking';
    if (intent.includes('support')) return 'support';
    return 'general';
  }

  private async trackResponseMetrics(conversationId: string, response: string, responseTime: number): Promise<void> {
    try {
      // Update both engagement types with response metrics
      await this.updatePlannerResponseMetrics(conversationId, response, responseTime);
      await this.updateGeneralResponseMetrics(conversationId, response, responseTime);
      
    } catch (error) {
      this.logger.error('Error tracking response metrics:', error);
    }
  }

  private async updatePlannerResponseMetrics(conversationId: string, response: string, responseTime: number): Promise<void> {
    try {
      const plannerEngagement = await this.prisma.plannerEngagement.findFirst({
        where: { conversationId }
      });

      if (plannerEngagement && this.isResponseToPlan(response)) {
        const planData = plannerEngagement.planData as any || {};
        
        await this.prisma.plannerEngagement.update({
          where: { id: plannerEngagement.id },
          data: {
            planGenerated: true,
            planData: {
              ...planData,
              generatedPlan: response,
              planGeneratedAt: new Date(),
              responseTime: responseTime
            }
          }
        });
      }
    } catch (error) {
      this.logger.error('Error updating planner response metrics:', error);
    }
  }

  private async updateGeneralResponseMetrics(conversationId: string, response: string, responseTime: number): Promise<void> {
    try {
      const whatsappEngagement = await this.prisma.whatsAppEngagement.findFirst({
        where: { conversationId, isActive: true }
      });

      if (whatsappEngagement) {
        const currentAnalytics = whatsappEngagement.analytics as any || {};
        const totalResponses = (currentAnalytics.totalResponses || 0) + 1;
        const avgResponseTime = currentAnalytics.averageResponseTime || 0;
        
        // Calculate new average response time
        const newAvgResponseTime = ((avgResponseTime * (totalResponses - 1)) + responseTime) / totalResponses;
        
        await this.prisma.whatsAppEngagement.update({
          where: { id: whatsappEngagement.id },
          data: {
            responseTime: newAvgResponseTime,
            analytics: {
              ...currentAnalytics,
              totalResponses: totalResponses,
              averageResponseTime: newAvgResponseTime,
              lastResponse: response,
              lastResponseTime: responseTime,
              responseQuality: this.assessResponseQuality(response)
            }
          }
        });
      }
    } catch (error) {
      this.logger.error('Error updating general response metrics:', error);
    }
  }

  private isResponseToPlan(response: string): boolean {
    const planResponseKeywords = ['itinerary', 'plan', 'schedule', 'day 1', 'day 2', 'morning', 'afternoon', 'evening'];
    return planResponseKeywords.some(keyword => response.toLowerCase().includes(keyword));
  }

  private async trackErrorMetrics(conversationId: string, errorMessage: string): Promise<void> {
    try {
      // Track errors in both engagement types
      await this.updatePlannerErrorMetrics(conversationId, errorMessage);
      await this.updateGeneralErrorMetrics(conversationId, errorMessage);
      
    } catch (error) {
      this.logger.error('Error tracking error metrics:', error);
    }
  }

  private async updatePlannerErrorMetrics(conversationId: string, errorMessage: string): Promise<void> {
    try {
      const plannerEngagement = await this.prisma.plannerEngagement.findFirst({
        where: { conversationId }
      });

      if (plannerEngagement) {
        const planData = plannerEngagement.planData as any || {};
        const errors = planData.errors || [];
        
        await this.prisma.plannerEngagement.update({
          where: { id: plannerEngagement.id },
          data: {
            planData: {
              ...planData,
              errors: [...errors, {
                message: errorMessage,
                timestamp: new Date()
              }],
              lastError: errorMessage,
              errorCount: errors.length + 1
            }
          }
        });
      }
    } catch (error) {
      this.logger.error('Error updating planner error metrics:', error);
    }
  }

  private async updateGeneralErrorMetrics(conversationId: string, errorMessage: string): Promise<void> {
    try {
      const whatsappEngagement = await this.prisma.whatsAppEngagement.findFirst({
        where: { conversationId, isActive: true }
      });

      if (whatsappEngagement) {
        const currentAnalytics = whatsappEngagement.analytics as any || {};
        const errorCount = (currentAnalytics.errorCount || 0) + 1;
        
        await this.prisma.whatsAppEngagement.update({
          where: { id: whatsappEngagement.id },
          data: {
            analytics: {
              ...currentAnalytics,
              errorCount: errorCount,
              lastError: errorMessage,
              lastErrorTime: new Date()
            }
          }
        });
      }
    } catch (error) {
      this.logger.error('Error updating general error metrics:', error);
    }
  }

  private calculateEngagementScore(message: string, intent: string): number {
    let score = 0;
    
    // Base score for message length
    score += Math.min(message.length / 10, 10);
    
    // Intent-based scoring
    const intentScores = {
      'travel_inquiry': 8,
      'booking': 10,
      'support': 6,
      'greeting': 3,
      'general': 4,
    };
    score += intentScores[intent] || 2;
    
    // Question marks indicate engagement
    score += (message.match(/\?/g) || []).length * 2;
    
    // Exclamation marks indicate enthusiasm
    score += (message.match(/!/g) || []).length * 1.5;
    
    return Math.min(score, 20); // Cap at 20
  }

  private updateEngagementScore(currentScore: number, newScore: number): number {
    // Weighted average with more weight on recent interactions
    return Math.round((currentScore * 0.7 + newScore * 0.3) * 100) / 100;
  }

  private updateIntentHistory(currentIntents: string[], newIntent: string): string[] {
    const intents = [...currentIntents];
    intents.push(newIntent);
    
    // Keep only last 10 intents
    return intents.slice(-10);
  }

  private updateAverageResponseTime(currentAvg: number | null, newTime: number | null): number | null {
    if (!newTime) return currentAvg;
    if (!currentAvg) return newTime;
    
    // Simple moving average
    return Math.round((currentAvg + newTime) / 2);
  }

  private calculateMessageFrequency(messageCount: number, createdAt: Date): number {
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.round((messageCount / Math.max(hoursSinceCreation, 1)) * 100) / 100;
  }

  private updateAverageResponseLength(currentAvg: number, responseCount: number, newLength: number): number {
    if (responseCount === 0) return newLength;
    return Math.round(((currentAvg * responseCount) + newLength) / (responseCount + 1));
  }

  private assessResponseQuality(response: string): string {
    // Simple quality assessment based on response characteristics
    if (response.length < 20) return 'low';
    if (response.length > 200 && response.includes('?')) return 'high';
    if (response.length > 100) return 'medium';
    return 'low';
  }

  private buildConversationHistory(messages: any[]): string {
    if (!messages || messages.length === 0) return '';
    
    return messages
      .slice(0, 8) // Last 8 messages for context
      .reverse() // Chronological order
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n');
  }

  private buildContextPrompt(
    currentMessage: string,
    conversationHistory: string,
    userName?: string,
    language: string = 'en',
    intent?: string,
    context?: any
  ): string {
    // Determine if address should be included based on context
    const shouldIncludeAddress = this.shouldIncludeAddress(currentMessage, intent, context);
    
    const basePrompt = `You are a professional travel assistant for Marmara Travel. 

CONVERSATION HISTORY:
${conversationHistory}

CURRENT MESSAGE: ${currentMessage}

CONTEXT:
- Customer Name: ${userName || 'Not provided'}
- Language: ${language === 'sw' ? 'Kiswahili' : 'English'}
- Detected Intent: ${intent || 'general_inquiry'}
- Previous Context: ${context ? JSON.stringify(context) : 'New conversation'}

RESPONSE GUIDELINES:
1. Keep responses SHORT and NATURAL (maximum 2-3 sentences)
2. Respond in ${language === 'sw' ? 'Kiswahili' : 'English'}
3. Use conversational, friendly tone - avoid robotic language
4. Be helpful and professional but casual
5. Focus on our services: Hotels, Visa, Tickets (flights), and Logistics from Dubai to worldwide. Do not assume Zanzibar/Tanzania unless the user mentions it.
6. Use the customer's name if available
7. Ask a neutral follow-up question to understand their needs (destination, dates, number of travelers) without assuming.
8. Avoid long explanations unless specifically requested
${shouldIncludeAddress ? '9. Include our office address: Marmara Travel, Stone Town, Zanzibar' : ''}

IMPORTANT: 
- Keep responses under 100 words
- Sound natural and human-like
- Don\'t repeat information already discussed
- If this is the first greeting/response, briefly mention our core services: Hotels, Visa, Tickets, and Logistics from Dubai to anywhere.
- Only provide address when customer is new, confused about location, or specifically asks

Current message to respond to: ${currentMessage}`;

    return basePrompt;
  }

  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) return 'booking';
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('bei')) return 'pricing';
    if (lowerMessage.includes('safari') || lowerMessage.includes('tour')) return 'safari_inquiry';
    if (lowerMessage.includes('zanzibar') || lowerMessage.includes('beach')) return 'zanzibar_inquiry';
    if (lowerMessage.includes('flight') || lowerMessage.includes('flights') || lowerMessage.includes('ndege')) return 'flight_inquiry';
    if (lowerMessage.includes('ticket') || lowerMessage.includes('tickets') || lowerMessage.includes('tiketi')) return 'ticket_inquiry';
    if (lowerMessage.includes('hotel') || lowerMessage.includes('hotels') || lowerMessage.includes('hoteli')) return 'accommodation';
    if (lowerMessage.includes('visa')) return 'visa_inquiry';
    if (lowerMessage.includes('logistics') || lowerMessage.includes('cargo') || lowerMessage.includes('shipping') || lowerMessage.includes('freight') || lowerMessage.includes('delivery') || lowerMessage.includes('courier') || lowerMessage.includes('usafirishaji') || lowerMessage.includes('dubai')) return 'logistics_inquiry';
    if (lowerMessage.includes('help') || lowerMessage.includes('msaada')) return 'support';
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('habari')) return 'greeting';
    
    return 'general_inquiry';
  }

  private getFallbackResponse(language: string, intent?: string): string {
    const responses = {
      en: {
        greeting: "Hello! Welcome to Marmara Travel. We handle Hotels, Visa processing, Flight Tickets, and Logistics from Dubai to worldwide. How can we help today?",
        booking: "I'd be happy to help you with your booking! Please share your travel dates, destination, and number of travelers.",
        pricing: "For pricing, please tell me your destination, dates, and group size. I’ll provide tailored options.",
        safari_inquiry: "We offer premium safari experiences across East Africa. Would you like Tanzania or another destination?",
        zanzibar_inquiry: "Zanzibar is wonderful! We can arrange hotels, flights, and activities. When are you planning to visit?",
        flight_inquiry: "We arrange flights globally and can issue tickets quickly. What’s your destination and preferred dates?",
        ticket_inquiry: "We can issue flight tickets worldwide—economy or business. Please share destination and dates.",
        accommodation: "We work with top hotels globally. Which destination and budget range should we consider?",
        visa_inquiry: "We assist with visa processing for many destinations. Which country’s visa and your nationality, please?",
        logistics_inquiry: "We manage logistics and shipping from Dubai to worldwide—courier, cargo, and freight. What are you shipping and to where?",
        support: "I’m here to help. Tell me what you need regarding Hotels, Visa, Tickets, or Logistics.",
        general_inquiry: "Thanks for contacting Marmara Travel. We provide Hotels, Visa processing, Flight Tickets, and Logistics from Dubai to worldwide. What would you like help with?"
      },
      sw: {
        greeting: "Hujambo! Karibu Marmara Travel. Tunashughulikia Hoteli, Visa, Tiketi za Ndege, na Usafirishaji kutoka Dubai kwenda duniani kote. Naweza kukusaidiaje leo?",
        booking: "Nitafurahi kukusaidia na uhifadhi. Tafadhali taja tarehe za safari, mahali unapotaka kwenda, na idadi ya wasafiri.",
        pricing: "Kwa bei sahihi, niambie unakoenda, tarehe, na idadi ya watu ili nikupatie chaguo bora.",
        safari_inquiry: "Tunatoa safari za kiwango cha juu Afrika Mashariki. Unapenda Tanzania au nchi nyingine?",
        zanzibar_inquiry: "Zanzibar ni nzuri sana! Tunaweza kupanga hoteli, ndege, na shughuli. Unapanga kwenda lini?",
        flight_inquiry: "Tunaweza kupanga ndege na kutoa tiketi popote duniani. Unapenda kwenda wapi na lini?",
        ticket_inquiry: "Tunatoa tiketi za ndege duniani kote—economy au business. Tafadhali taja mahali na tarehe.",
        accommodation: "Tunafanya kazi na hoteli bora duniani. Unapenda kwenda wapi na bajeti yako ni kiasi gani?",
        visa_inquiry: "Tunasaidia kupata visa kwa nchi mbalimbali. Tafadhali taja nchi husika na uraia wako.",
        logistics_inquiry: "Tunasimamia usafirishaji kutoka Dubai kwenda duniani kote—courier, cargo, na freight. Unasafirisha nini na kwenda wapi?",
        support: "Nipo hapa kukusaidia. Niambie unahitaji nini kuhusu Hoteli, Visa, Tiketi, au Usafirishaji.",
        general_inquiry: "Asante kwa kuwasiliana na Marmara Travel. Tunatoa Hoteli, Visa, Tiketi za Ndege, na Usafirishaji kutoka Dubai kwenda duniani kote. Unahitaji msaada gani?"
      }
    };
    
    return responses[language]?.[intent] || responses[language]?.general_inquiry || responses.en.general_inquiry;
  }

  private async updateConversationContext(conversationId: string, userMessage: string, aiResponse: string): Promise<void> {
    try {
      // Detect intent and extract entities
      const intent = this.detectIntent(userMessage);
      const language = this.detectSwahili(userMessage) ? 'sw' : 'en';
      const entities = this.extractEntities(userMessage);
      
      // Get current conversation to check message count
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { _count: { select: { messages: true } } }
      });
      
      if (!conversation) return;
      
      // Determine customer type based on conversation history
      const customerType = this.determineCustomerType(conversation._count.messages, conversation.context);
      
      // Determine conversation flow
      const conversationFlow = this.determineConversationFlow(intent, conversation._count.messages);
      
      // Build updated context
      const currentContext = conversation.context as any || {};
      const currentPreferences = currentContext.preferences || {};
      
      const updatedContext = {
        customerType,
        lastIntent: intent,
        conversationFlow,
        interests: this.updateInterests(currentContext.interests || [], entities.destinations),
        budget: this.detectBudget(userMessage) || currentContext.budget,
        travelDates: entities.dates.length > 0 ? entities.dates[0] : currentContext.travelDates,
        groupSize: entities.groupSize || currentContext.groupSize,
        previousBookings: currentContext.previousBookings || [],
        preferences: {
          ...currentPreferences,
          language,
          responseStyle: this.detectResponseStyle(userMessage),
        }
      };
      
      // Update conversation with new context
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          language,
          context: {
            set: updatedContext
          },
          lastMessageAt: new Date(),
        },
      });
      
      // Update message with extracted metadata
      await this.prisma.message.updateMany({
        where: {
          conversationId,
          content: userMessage,
          sender: 'USER',
        },
        data: {
          intent,
          entities: entities.destinations.concat(entities.dates),
          sentiment: this.detectSentiment(userMessage),
        },
      });
      
    } catch (error) {
      this.logger.error('Error updating conversation context:', error);
    }
  }

  private determineCustomerType(messageCount: number, context: any): string {
    // New customer: first few messages
    if (messageCount <= 3) return 'new';
    
    // VIP customer: has previous bookings or high engagement
    if (context?.previousBookings?.length > 0 || messageCount > 20) return 'vip';
    
    // Returning customer: moderate engagement
    if (messageCount > 5) return 'returning';
    
    return 'ongoing';
  }

  private updateInterests(currentInterests: string[], newDestinations: string[]): string[] {
    const interests = [...currentInterests];
    
    // Map destinations to interests
    newDestinations.forEach(dest => {
      const destLower = dest.toLowerCase();
      if (destLower.includes('safari') || destLower.includes('serengeti') || destLower.includes('ngorongoro')) {
        if (!interests.includes('safari')) interests.push('safari');
      }
      if (destLower.includes('zanzibar') || destLower.includes('beach') || destLower.includes('coast')) {
        if (!interests.includes('beach')) interests.push('beach');
      }
      if (destLower.includes('kilimanjaro') || destLower.includes('mountain') || destLower.includes('hiking')) {
        if (!interests.includes('adventure')) interests.push('adventure');
      }
      if (destLower.includes('culture') || destLower.includes('maasai') || destLower.includes('local')) {
        if (!interests.includes('culture')) interests.push('culture');
      }
    });
    
    return interests;
  }

  private detectBudget(message: string): string | null {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('budget') || messageLower.includes('cheap') || messageLower.includes('affordable')) {
      return 'low';
    }
    if (messageLower.includes('luxury') || messageLower.includes('premium') || messageLower.includes('expensive')) {
      return 'high';
    }
    if (messageLower.includes('mid-range') || messageLower.includes('moderate')) {
      return 'medium';
    }
    
    return null;
  }

  private detectResponseStyle(message: string): string {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('quick') || messageLower.includes('brief') || message.length < 20) {
      return 'concise';
    }
    if (messageLower.includes('detail') || messageLower.includes('explain') || message.length > 100) {
      return 'detailed';
    }
    
    return 'balanced';
  }

  private detectSentiment(message: string): string {
    const messageLower = message.toLowerCase();
    
    // Positive indicators
    const positiveWords = ['great', 'amazing', 'wonderful', 'excited', 'love', 'perfect', 'excellent', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'angry', 'worst'];
    
    const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    
    return 'neutral';
  }

  private extractEntities(message: string): { destinations: string[], dates: string[], groupSize?: number } {
    const lowerMessage = message.toLowerCase();
    const entities = {
      destinations: [] as string[],
      dates: [] as string[],
      groupSize: undefined as number | undefined
    };
    
    // Extract destinations
    const destinations = ['zanzibar', 'safari', 'serengeti', 'ngorongoro', 'kilimanjaro', 'arusha', 'dar es salaam'];
    destinations.forEach(dest => {
      if (lowerMessage.includes(dest)) {
        entities.destinations.push(dest);
      }
    });
    
    // Extract group size
    const groupMatch = message.match(/(\d+)\s*(people|person|watu|mtu)/i);
    if (groupMatch) {
      entities.groupSize = parseInt(groupMatch[1]);
    }
    
    // Extract dates (basic patterns)
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g,
      /(january|february|march|april|may|june|july|august|september|october|november|december)/gi,
      /(januari|februari|machi|aprili|mei|juni|julai|agosti|septemba|oktoba|novemba|desemba)/gi
    ];
    
    datePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.dates.push(...matches);
      }
    });
    
    return entities;
  }

  private determineConversationFlow(intent: string, messageCount: number): string {
    if (messageCount <= 1) return 'greeting';
    if (intent === 'greeting') return 'greeting';
    if (intent === 'pricing' || intent === 'booking') return 'negotiation';
    if (['safari_inquiry', 'zanzibar_inquiry', 'flight_inquiry', 'accommodation'].includes(intent)) return 'inquiry';
    return 'general';
  }

  // Human Takeover Management Methods
  private async detectHumanTakeover(messageText: string, senderNumber: string): Promise<boolean> {
    // Detect patterns that indicate human agent should take over
    const humanTakeoverPatterns = [
      /speak to.*human/i,
      /talk to.*agent/i,
      /customer service/i,
      /manager/i,
      /complaint/i,
      /problem/i,
      /issue/i,
      /not satisfied/i,
      /disappointed/i,
      /refund/i,
      /cancel.*booking/i,
      /emergency/i,
      /urgent/i
    ];

    return humanTakeoverPatterns.some(pattern => pattern.test(messageText));
  }

  private async shouldAIPause(conversation: any): Promise<boolean> {
    const context = conversation.context || {};
    
    // Check if AI is currently paused
    if (context.aiPausedUntil && new Date() < new Date(context.aiPausedUntil)) {
      return true;
    }

    // Check if human has taken over and hour hasn't passed
    if (context.isHumanTakeover && context.humanTakeoverAt) {
      const hoursSinceHumanTakeover = (Date.now() - new Date(context.humanTakeoverAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceHumanTakeover < 1; // Pause for 1 hour
    }

    return false;
  }

  private async handleHumanTakeover(conversationId: string, senderNumber: string): Promise<void> {
    try {
      const now = new Date();
      const aiPausedUntil = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now

      // Get current conversation to preserve existing context
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      const currentContext = conversation?.context || {};

      // Update conversation to indicate human takeover
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          context: {
            ...currentContext,
            isHumanTakeover: true,
            humanTakeoverAt: now,
            aiPausedUntil: aiPausedUntil,
            lastHumanMessage: now
          }
        }
      });

      // Send notification to human agents (you can implement this based on your notification system)
      this.logger.log(`Human takeover requested for conversation ${conversationId} from ${senderNumber}`);
      
      // Optionally send a message to the user
      await this.sendMessage(senderNumber, "I understand you'd like to speak with a human agent. Someone from our team will be with you shortly. Thank you for your patience.");
      
    } catch (error) {
      this.logger.error('Error handling human takeover:', error);
    }
  }

  // Method to allow human agents to resume AI control
  async resumeAIControl(conversationId: string): Promise<void> {
    try {
      // Get current conversation to preserve existing context
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
            lastHumanMessage: null
          }
        }
      });
      
      this.logger.log(`AI control resumed for conversation ${conversationId}`);
    } catch (error) {
      this.logger.error('Error resuming AI control:', error);
    }
  }

  // Smart address sharing logic
  private shouldIncludeAddress(currentMessage: string, intent?: string, context?: any): boolean {
    const lowerMessage = currentMessage.toLowerCase();
    
    // Include address if customer is asking about location/office
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || 
        lowerMessage.includes('office') || lowerMessage.includes('address') ||
        lowerMessage.includes('wapi') || lowerMessage.includes('mahali')) {
      return true;
    }
    
    // Include address for new customers (first few messages)
    if (context?.messageCount <= 2 && intent === 'greeting') {
      return true;
    }
    
    // Include address if customer seems confused or lost
    if (lowerMessage.includes('confused') || lowerMessage.includes('lost') ||
        lowerMessage.includes('find you') || lowerMessage.includes('come to')) {
      return true;
    }
    
    return false;
  }
}