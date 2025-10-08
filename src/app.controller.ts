import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Test endpoints for crash simulation
  @Get('test/crash/exit')
  testCrashExit(): string {
    console.log('🔥 Simulating process.exit() crash...');
    setTimeout(() => {
      console.log('💀 Executing process.exit(1)...');
      process.exit(1);
    }, 500);
    return 'Process will exit in 0.5 seconds...';
  }

  @Get('test/crash/exception')
  testCrashException(): string {
    console.log('💥 Simulating unhandled exception crash...');
    setTimeout(() => {
      console.log('💀 Throwing unhandled exception...');
      throw new Error('Simulated crash: Unhandled exception for testing monitor');
    }, 500);
    return 'Unhandled exception will be thrown in 0.5 seconds...';
  }

  @Get('test/crash/memory')
  testCrashMemory(): string {
    console.log('🧠 Simulating memory leak crash...');
    setTimeout(() => {
      const memoryLeak = [];
      while (true) {
        memoryLeak.push(new Array(1000000).fill('memory leak test'));
      }
    }, 1000);
    return 'Memory leak will start in 1 second...';
  }

  @Get('test/crash/timeout')
  testCrashTimeout(): string {
    console.log('⏰ Simulating timeout crash...');
    setTimeout(() => {
      while (true) {
        // Infinite loop to simulate hanging process
      }
    }, 1000);
    return 'Process will hang in 1 second...';
  }

  @Get('test/status')
  getTestStatus() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return {
      message: 'Server is running normally',
      timestamp: new Date().toISOString(),
      uptime,
      pid: process.pid,
      memory: memoryUsage,
      endpoints: [
        'GET /test/crash/exit - Simulates process.exit()',
        'GET /test/crash/exception - Simulates unhandled exception',
        'GET /test/crash/memory - Simulates memory leak',
        'GET /test/crash/timeout - Simulates hanging process',
        'GET /test/status - Shows server status',
        'GET /test/whatsapp-filter/:message - Tests WhatsApp message filtering'
      ]
    };
  }

  @Get('test/whatsapp-filter/:message')
  testWhatsAppFilter(@Param('message') message: string) {
    // Decode URL-encoded message
    const decodedMessage = decodeURIComponent(message);
    
    // Test the message filtering logic (similar to WhatsApp service)
    const shouldRespond = this.testMessageFilter(decodedMessage);

    // Derive language and intent similar to WhatsAppService
    const lowerMessage = decodedMessage.toLowerCase();
    const language = /\b(habari|hujambo|mambo|shikamoo|karibu|msaada|kusaidia|maelezo|swali|taarifa|ndege|hoteli|tiketi|usafirishaji)\b/i.test(lowerMessage) ? 'sw' : 'en';
    const intent = this.detectTestIntent(lowerMessage);

    // Build greeting/fallback similar to service
    const fallback = this.getTestFallbackResponse(language, intent);
    
    return {
      message: decodedMessage,
      shouldRespond,
      intent,
      language,
      timestamp: new Date().toISOString(),
      filterResult: shouldRespond ? 'Message will be processed' : 'Message will be ignored',
      sampleReply: fallback
    };
  }

  private detectTestIntent(lowerMessage: string): string {
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

  private getTestFallbackResponse(language: string, intent?: string): string {
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

  private testMessageFilter(messageText: string): boolean {
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
}
