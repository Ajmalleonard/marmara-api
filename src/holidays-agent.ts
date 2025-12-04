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
    'HTTP-Referer': 'https://marmaraholidays.com',
    'X-Title': 'Marmara Holidays',
  },
});

type StreamCallback = (chunk: string) => void;
const MAX_RESPONSE_LENGTH = 200;

const SITE_LINKS = {
  CONTACT: 'https://www.marmaraholidays.com/contact',
  ABOUT: 'https://marmaraholidays.com/about',
  TOURS: 'https://marmaraholidays.com/tours',
  SAFARI: 'https://marmaraholidays.com/safari',
  HELP_CENTER: 'https://marmaraholidays.com/help',
};

interface Link {
  label: string;
  url: string;
}

function generateLinksBlock(links: Link[]): string {
  const lines = ['Helpful links:'];
  for (const l of links) lines.push(`• ${l.label}: ${l.url}`);
  return lines.join('\n');
}

function getRelevantLinks(userMessage: string, intent?: string): Link[] {
  const text = (userMessage || '').toLowerCase();
  const results: Link[] = [];
  const add = (label: string, url: string) => {
    if (!results.find((r) => r.url === url)) results.push({ label, url });
  };

  if (intent === 'contact_request') {
    add('Contact Us', SITE_LINKS.CONTACT);
  }

  const hasAny = (keywords: string[]) => keywords.some((k) => text.includes(k));

  if (hasAny(['contact', 'phone', 'call', 'reach', 'support', 'email', 'address', 'office', 'whatsapp'])) {
    add('Contact Us', SITE_LINKS.CONTACT);
  }
  if (hasAny(['safari', 'tour', 'package', 'holiday', 'trip', 'serengeti', 'kilimanjaro', 'zanzibar'])) {
    add('Tours & Safari', SITE_LINKS.TOURS);
  }
  if (hasAny(['about', 'who are you', 'about us', 'company'])) {
    add('About Us', SITE_LINKS.ABOUT);
  }
  if (hasAny(['help', 'guide', 'how to', 'process', 'assistance'])) {
    add('Help', SITE_LINKS.HELP_CENTER);
  }

  return results;
}

const GREETING_TEMPLATES = [
  'Welcome to Marmara Holidays! 🌍 We offer safaris, tours & holidays across Tanzania. What can we help you with?',
  'Hello! Welcome to Marmara Holidays. Explore Tanzania\'s wildlife, beaches & culture with us. How can we assist?',
  'Karibu to Marmara Holidays! 🦁 Your Tanzania safari & tour experts. What adventure interests you?',
  'Welcome! Discover Tanzania with Marmara Holidays. Ask us about safaris, tours, or any travel questions!',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sanitizeOutput(text: string): string {
  return text.replace(/[\-–—‑]+/g, ' ');
}

// Tanzania & tourism related keywords
const TANZANIA_KEYWORDS = [
  'tanzania', 'zanzibar', 'dar es salaam', 'arusha', 'moshi', 'serengeti', 'kilimanjaro', 
  'ngorongoro', 'tarangire', 'selous', 'mbeya', 'dodoma', 'stone town', 'pembas'
];

const SAFARI_KEYWORDS = [
  'safari', 'tour', 'package', 'holiday', 'trip', 'vacation', 'getaway', 'wildlife', 
  'game drive', 'trek', 'hiking', 'climbing', 'beach', 'cultural tour', 'adventure',
  'lion', 'elephant', 'leopard', 'buffalo', 'zebra', 'giraffe', 'wildebeest'
];

const SERVICE_KEYWORDS = [
  'book', 'booking', 'reserve', 'reservation', 'price', 'cost', 'how much', 'when', 
  'schedule', 'date', 'days', 'nights', 'guide', 'transport', 'accommodation', 'hotel',
  'visa', 'permit', 'requirement', 'packing', 'best time', 'weather'
];

const MONTH_KEYWORDS = [
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 
  'september', 'october', 'november', 'december',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'
];

const NON_QUESTION_PHRASES = [
  'ok', 'okay', 'thanks', 'thank you', 'hello', 'hi', 'hey', 'bye', 'lol', 'haha',
  'yes', 'no', 'yup', 'nope', 'cool', 'nice', 'good', 'great', 'awesome', 'hahaha'
];

function isTanzaniaRelated(text: string): boolean {
  const t = (text || '').toLowerCase().trim();
  return TANZANIA_KEYWORDS.some((k) => t.includes(k)) || SAFARI_KEYWORDS.some((k) => t.includes(k));
}

function isServiceRelated(text: string): boolean {
  const t = (text || '').toLowerCase().trim();
  return SERVICE_KEYWORDS.some((k) => t.includes(k));
}

function isValidQuestion(text: string): boolean {
  const t = (text || '').toLowerCase().trim();
  
  // Check if it's just a non-question phrase
  if (NON_QUESTION_PHRASES.includes(t) || t.length < 2) {
    return false;
  }
  
  // Check if it's related to our services
  if (isTanzaniaRelated(t) || isServiceRelated(t)) {
    return true;
  }
  
  // Check if it has question indicators
  if (t.includes('?') || t.includes('how') || t.includes('what') || 
      t.includes('where') || t.includes('when') || t.includes('why') ||
      t.includes('which') || t.includes('can') || t.includes('could') ||
      t.includes('would')) {
    return true;
  }
  
  return false;
}

function shouldRespond(intent: string, text: string): boolean {
  if (intent === 'greeting' || intent === 'service_inquiry' || intent === 'contact_request') {
    return true;
  }
  return isValidQuestion(text);
}

export async function EngageHolidaysAgent(
  userMessage: string,
  onStream: StreamCallback,
  userName?: string,
  isRecentFollowUp?: boolean,
) {
  console.log('HolidaysAgent analysis:start');

  // First check if this is a valid question
  if (!isValidQuestion(userMessage) && !isRecentFollowUp) {
    console.log('HolidaysAgent skip:invalid-question');
    onStream("Sorry, I can't help with that. Please ask us about our Tanzania safaris, tours, or holidays! 🌍");
    return;
  }

  const analysisPrompt = `
    Analyze this message: "${userMessage}"
    
    Intents:
    - "greeting": User saying hello
    - "service_inquiry": Asking about safaris, tours, holidays, bookings, prices, dates, guides, visas, etc.
    - "contact_request": Asking for contact info
    - "other": Something else
    
    Respond with ONLY the intent word (one of the 4 above). Nothing else.
  `;

  const analysisStream = await groq.chat.completions.create({
    messages: [
      { role: 'system' as const, content: 'You are an intent classifier.' },
      { role: 'user' as const, content: analysisPrompt },
    ],
    stream: false,
    model: 'groq/compound-mini',
    temperature: 0.1,
  });

  const intent = (analysisStream.choices[0]?.message?.content || 'other').trim().toLowerCase();
  console.log('HolidaysAgent analysis:intent', intent);

  // Handle greetings
  if (intent === 'greeting') {
    const reply = pickRandom(GREETING_TEMPLATES);
    console.log('HolidaysAgent greeting:reply');
    onStream(reply);
    return;
  }

  // Handle non-tourism questions
  if (intent === 'other' && !isRecentFollowUp) {
    console.log('HolidaysAgent skip:not-tourism');
    onStream("Sorry, I can't help with that. We specialize in Tanzania safaris, tours & holidays. How can we help your travel plans? 🦁");
    return;
  }

  const userNameContext = userName ? `The user's name is ${userName}.` : '';

  let responsePrompt = '';
  if (intent === 'service_inquiry' || intent === 'contact_request') {
    responsePrompt = `
      You are an assistant for Marmara Holidays - a Tanzania travel company specializing in safaris and tours.
      
      User message: "${userMessage}"
      ${userNameContext}
      
      IMPORTANT - CHARACTER LIMIT: Keep your response under 200 characters. Be concise and helpful.
      
      ABOUT MARMARA HOLIDAYS:
      - Tanzania safari and tour specialists
      - Locations: Dar Es Salaam, Arusha, Zanzibar
      - Services: Serengeti safaris, Kilimanjaro treks, Zanzibar tours, cultural experiences, beach getaways
      - Professional guides, flexible packages, competitive pricing
      
      CONTACT INFO:
      WhatsApp/Phone: Available on website
      Email: contact@marmaraholidays.com
      Web: www.marmaraholidays.com
      
      TONE: Friendly, professional, enthusiastic about Tanzania. Keep it short and direct.
      
      Answer their question directly without greeting them. If asking for contact: direct to WhatsApp or website.
    `;
  } else {
    responsePrompt = `
      You are an assistant for Marmara Holidays Tanzania.
      
      The user message: "${userMessage}"
      
      CHARACTER LIMIT: Keep response under 200 characters. 
      
      This seems unrelated to our Tanzania safaris & tours. Politely redirect to our services.
      Response should be brief and friendly.
    `;
  }

  console.log('HolidaysAgent response:prompt_built');

  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: 'system' as const,
        content:
          'You are a helpful assistant for Marmara Holidays, a Tanzania safari and tour company. Be concise (max 200 characters), friendly, and professional. Answer questions about safaris, tours, bookings, prices, dates, guides, visas, and travel details. For topics outside tourism, politely decline.',
      },
      { role: 'user' as const, content: responsePrompt },
    ],
    stream: true,
    model: 'groq/compound-mini',
    temperature: 0.7,
  });

  console.log('HolidaysAgent stream:start');

  let chunks = 0;
  let totalLen = 0;
  let fullResponse = '';

  for await (const chunk of stream) {
    const raw = chunk.choices[0]?.delta?.content || '';
    const content = sanitizeOutput(raw);
    
    // Track total length to enforce character limit
    totalLen += content.length;
    fullResponse += content;
    
    // Stop if exceeding max response length
    if (totalLen > MAX_RESPONSE_LENGTH) {
      const trimmed = fullResponse.substring(0, MAX_RESPONSE_LENGTH).trim();
      onStream(trimmed);
      console.log('HolidaysAgent stream:truncated at', MAX_RESPONSE_LENGTH);
      return;
    }
    
    onStream(content);
    chunks += 1;
  }

  console.log('HolidaysAgent stream:end', { chunks, totalLen });

  // Add relevant links if applicable
  const relevantLinks = getRelevantLinks(userMessage, intent);
  if (relevantLinks.length && totalLen < MAX_RESPONSE_LENGTH - 50) {
    onStream(`\n\n${generateLinksBlock(relevantLinks)}`);
  }

  console.log('HolidaysAgent links:count', relevantLinks.length);
  console.log('HolidaysAgent done');
}
