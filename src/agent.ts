import Groq from 'groq-sdk';
import OpenAI from 'openai';

const groq = new Groq({
  apiKey: process.env.SQKEYS,
  dangerouslyAllowBrowser: true,
});

const openai = new OpenAI({ 
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.SQKEYS,
  defaultHeaders: {
    'HTTP-Referer': 'https://marmaratravels.com', 
    'X-Title': 'Marmara Travels', 
  },
});

type StreamCallback = (chunk: string) => void;
const SITE_LINKS = {
  CONTACT: 'https://www.marmaratravels.com/contact',
  FAQS: 'https://marmaratravels.com/v1.0/faqs',
  ABOUT: 'https://marmaratravels.com/v1.0/about',
  HELP_CENTER: 'https://marmaratravels.com/v1.0/help-center',
  PRIVACY: 'https://marmaratravels.com/v1.0/privacy',
};
interface Link {
  label: string;
  url: string;
}
function generateLinksBlock(links: Link[]): string {
  const lines = ['Helpful link(s):'];
  for (const l of links) lines.push(`• ${l.label}: ${l.url}`);
  return lines.join('\n');
}
function getRelevantLinks(userMessage: string, intent?: string): Link[] {
  const text = (userMessage || '').toLowerCase();
  const results: Link[] = [];
  const add = (label: string, url: string) => {
    if (!results.find((r) => r.url === url)) results.push({ label, url });
  };
  // Intent-driven defaults
  if (intent === 'contact_request') {
    add('Contact', SITE_LINKS.CONTACT);
  }
  // Keyword-driven matching
  const hasAny = (keywords: string[]) => keywords.some((k) => text.includes(k));
  if (
    hasAny([
      'contact',
      'phone',
      'call',
      'reach',
      'support',
      'email',
      'address',
      'location',
      'office',
      'whatsapp',
      'connect',
    ])
  ) {
    add('Contact', SITE_LINKS.CONTACT);
  }
  if (hasAny(['faq', 'faqs', 'frequently asked'])) {
    add('FAQs', SITE_LINKS.FAQS);
  }
  if (hasAny(['about', 'who are you', 'about us', 'company', 'profile'])) {
    add('About', SITE_LINKS.ABOUT);
  }
  if (
    hasAny([
      'help',
      'guide',
      'instructions',
      'how to',
      'process',
      'steps',
      'assistance',
      'support',
    ])
  ) {
    add('Help Center', SITE_LINKS.HELP_CENTER);
  }
  if (
    hasAny([
      'privacy',
      'policy',
      'personal data',
      'gdpr',
      'privacy policy',
      'data',
    ])
  ) {
    add('Privacy', SITE_LINKS.PRIVACY);
  }
  return results;
}
const GREETING_TEMPLATES = [
  'Welcome to Marmara Travels!\n\nStay up-to-date with fresh travel experiences and exclusive offers on our channel. We are your one stop shop for:\n\n✈️ Air Tickets\n🛂 Visa Services\n📦 Cargo Solutions\n🌴 Safari & Holiday Packages (Inbound & Outbound)\n🚗 Transfers\n🚣‍♀️ Boat Tickets\n\nLet’s explore the world together with Marmara Travels!\n#MarmaraTravels #TravelUpdates #TravelExperiences #ExploreTheWorld',
  'Hi there, welcome to Marmara Travels! We are glad you are here. From air tickets and visa support to cargo and unforgettable safaris, we make travel simple. Tell me what you need and we will get started.',
  'Hello! Great to have you with us at Marmara Travels. Looking for flights, visas, holidays, transfers, or boat tickets? Share a destination or date, and I will plan it for you.',
  'A warm welcome to Marmara Travels. We help with quick visa processing, great flight deals, hotel reservations, cargo, and tailored safari packages. What are you planning next?',
  'Welcome! At Marmara Travels, we keep you updated with new travel experiences and deals. When you are ready, say where you are headed or what you need, like tickets, visa, cargo, safaris, or transfers, and we will take it from there.',
];
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function sanitizeOutput(text: string): string {
  // Remove hyphens/dashes of different types
  return text.replace(/[\-–—‑]+/g, ' ');
}
// Enhanced destination detection for one-word replies like "dubai"
const DESTINATION_KEYWORDS = [
  'dubai','uae','abu dhabi','doha','qatar','saudi','riyadh','jeddah',
  'zanzibar','tanzania','kenya','nairobi','mombasa','arusha','dar es salaam','serengeti',
  'egypt','cairo','morocco','marrakech','turkey','istanbul','bali','indonesia','thailand','maldives','mauritius',
  'paris','france','london','uk','rome','italy','athens','greece','madrid','spain','singapore','new york','usa','canada'
];
// Date and group-size detection for short follow-ups
const MONTH_KEYWORDS = [
  'january','february','march','april','may','june','july','august','september','october','november','december',
  'jan','feb','mar','apr','jun','jul','aug','sep','sept','oct','nov','dec'
];
const GROUP_SIZE_KEYWORDS = [
  'alone','solo','just me','only me','one person','1 person','2 people','3 people','4 people','pax','adult','adults','child','children','kids','infant','family','couple','group'
];
const NON_NAME_STOPWORDS = [
  'ok','okay','thanks','thank you','hello','hi','hey','yes','no','yup','nope','lol','haha','hahaha'
];
function looksLikeDate(text: string): boolean {
  const t = (text || '').toLowerCase();
  if (MONTH_KEYWORDS.some((m) => t.includes(m))) return true;
  // Simple numeric date patterns like 17/01 or 17-01
  return /\b\d{1,2}[\/-]\d{1,2}\b/.test(t) || /\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(t);
}
function looksLikeGroupSize(text: string): boolean {
  const t = (text || '').toLowerCase();
  return GROUP_SIZE_KEYWORDS.some((k) => t.includes(k)) || /\b\d+\s*(pax|people|persons|traveler|travellers|adults?|children|kids)\b/.test(t);
}
function looksLikeNameReply(text: string): boolean {
  const t = (text || '').toLowerCase().trim();
  if (/\b(my name is|i am|i'm|this is|call me)\b/.test(t)) return true;
  // Single-word alphabetic names (filter out common stopwords)
  if (!t.includes(' ') && /^[a-zA-Z]{2,20}$/.test(t) && !NON_NAME_STOPWORDS.includes(t)) return true;
  return false;
}
function isBusinessMessage(text: string): boolean {
  const t = (text || '').toLowerCase().trim();
  const keywords = [
    'visa','ticket','flight','hotel','book','booking','safari','holiday','tour','cargo','transfer','boat','reservation',
    'price','cost','quote','deal','offer','schedule','date','itinerary','travel','package','help','assistance','msaada','destination'
  ];
  const hasServiceKeyword = keywords.some((k) => t.includes(k));
  const hasDestination = DESTINATION_KEYWORDS.some((d) => t.includes(d));
  const isSingleDestination = !t.includes(' ') && DESTINATION_KEYWORDS.includes(t);
  const hasDate = looksLikeDate(t);
  const hasGroup = looksLikeGroupSize(t);
  const isName = looksLikeNameReply(t);
  return hasServiceKeyword || hasDestination || isSingleDestination || hasDate || hasGroup || isName;
}
function shouldRespond(intent: string, text: string): boolean {
  if (
    intent === 'service_inquiry' ||
    intent === 'contact_request' ||
    intent === 'greeting'
  ) {
    return true;
  }
  return isBusinessMessage(text);
}

export async function EngageAgent(
  userMessage: string,
  onStream: StreamCallback,
  userName?: string,
  isRecentFollowUp?: boolean,
) {
  // 1. Analyze the user's message to determine intent
  const analysisPrompt = `
    Analyze the following user message to determine the user's intent. The user message is: "${userMessage}"

    Possible intents are:
    - "greeting": The user is just saying hello.
    - "service_inquiry": The user is asking about one of our services (VISA, tickets, hotels, tours, etc.).
    - "contact_request": The user is asking for contact information.
    - "chit_chat": The user is making small talk.
    - "other": The user's intent is unclear or doesn't fit into the other categories.

    Based on the message, what is the user's primary intent? Respond with one of the intents listed above.
  `;

  const analysisStream = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an intent analysis expert.',
      },
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
    stream: false, // We need the full response to analyze the intent
    model: 'openai/gpt-oss-120b',
    temperature: 0.2,
  });

  const intent = analysisStream.choices[0]?.message?.content.trim() || 'other';

  // Short-circuit for greeting intent with random template
  if (intent === 'greeting') {
    const reply = pickRandom(GREETING_TEMPLATES);
    onStream(reply);
    return;
  }

  // Decide whether to respond or skip non-business/personal chat
  if (!shouldRespond(intent, userMessage) && !isRecentFollowUp) {
    console.log('Skiping non-business message');
    return;
  }

  // 2. Decide if the bot can help
  let canHelp = false;
  if (intent === 'service_inquiry' || intent === 'contact_request') {
    canHelp = true;
  }
  // Treat destination/date/name/group-size replies as help even if intent classifier returns "other"
  if (!canHelp && (isBusinessMessage(userMessage) || isRecentFollowUp)) {
    canHelp = true;
  }

  // 3. Generate a response
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const userNameContext = userName
    ? `The user's name is ${userName}. Address them personally when appropriate.`
    : 'No user name available.';

  let responsePrompt = '';

  if (canHelp) {
    responsePrompt = `
      You are Talib from Marmara Travels team - a warm, professional, and personable travel assistant. The user message is: "${userMessage}"
      
      The user is asking about our services. Provide a helpful and enthusiastic response.

      PERSONALIZATION CONTEXT:
      - Current time of day: ${timeOfDay}
      - ${userNameContext}
      - Do not start with a greeting; respond directly to their request.
      - If the user's message is a single destination or very short (e.g., "dubai"), treat it as a service inquiry and ask 2–3 clarifying questions (dates, number of travelers, departure city).
      
      COMPANY INFORMATION:
      Marmara Travel Services specializes in:
      - VISA processing and documentation
      - Airline Tickets worldwide
      - Hotel Reservations globally  
      - Clearing and forwarding services from Dubai to any destination worldwide
      - Luxury tours to Tanzania (including Zanzibar), Kenya, Dubai, Bali and expanding destinations
      
      OFFICE LOCATIONS:
      🇦🇪 Dubai Office: +971 50 523 0039
      3rd Floor, Office #307, Near Naif Police Station, Al Daghaya Road, Deira, Dubai, U.A.E
      Email: cargo@marmaratravels.com
      
      🇹🇿 Dar Es Salaam Office: +255 777 710 000 / +255 718 710 000
      Mahiwa Street, Dar Es Salaam | Web: www.marmaratravels.com
      
      🏝️ Zanzibar Office: +255 777 740 000
      Kiembe Samaki | Direct: cargo.marmaratravels.com

      LANGUAGE & TONE GUIDELINES:
      - Detect user's language (English/Swahili) and respond accordingly
      - Use warm, personal, and enthusiastic tone - NOT robotic
      - Be genuinely helpful and show excitement about travel
      - Use conversational language with personality
      - Include appropriate emojis when fitting
      - Address users by name when available
      - Show genuine interest in their travel dreams
      
      WRITING STYLE:
      • Use warm, conversational language with personality
      • Be enthusiastic about travel and helping customers
      • Use short, engaging sentences that flow naturally
      • Include relevant emojis for warmth and visual appeal
      • Ask engaging questions to understand their needs        
      • Show genuine excitement about their travel plans
      • Be helpful, not just informative
      • Make them feel special and valued
    `;
  } else {
    responsePrompt = `
      You are Talib from Marmara Travels. The user has sent a message that is not related to our services. Respond politely and professionally, and gently guide the conversation back to our travel services if appropriate.

      The user message is: "${userMessage}"
    `;
  }

  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          "You are Talib from Marmara Travel - a warm, enthusiastic travel assistant who loves helping people create amazing travel experiences. You're personable, professional, and genuinely excited about travel. Avoid greetings unless the user's intent is a greeting; respond directly and helpfully. Address users by name when available, and make every interaction feel personal. Avoid hyphens and dashes in responses.",
      },
      {
        role: 'user',
        content: responsePrompt,
      },
    ],
    stream: true,
    model: 'groq/compound-mini',
    temperature: 1,
    compound_custom: {
      tools: {
        enabled_tools: ['web_search', 'code_interpreter', 'visit_website'],
      },
    },
  });

  for await (const chunk of stream) {
    const raw = chunk.choices[0]?.delta?.content || '';
    const content = sanitizeOutput(raw);
    onStream(content);
  }
  const relevantLinks = getRelevantLinks(userMessage, intent);
  if (relevantLinks.length) {
    onStream(`\n\n${generateLinksBlock(relevantLinks)}`);
  }
}