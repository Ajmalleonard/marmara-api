# Groq AI Integration Guide for WhatsApp Service

## Overview
The WhatsApp service now integrates with Groq AI to provide intelligent, context-aware responses in both English and Kiswahili. This integration leverages the DeepSeek R1 model for sophisticated conversation handling while maintaining professional travel service standards.

## Features

### 🤖 **Groq AI Integration**
- **Model**: DeepSeek R1 Distill Llama 70B
- **Streaming**: Real-time response generation
- **Context-Aware**: Understands travel industry context
- **Professional**: Maintains Marmara Travel brand voice

### 🌍 **Bilingual Support**
- **Language Detection**: Automatically detects English vs Kiswahili
- **Smart Responses**: Responds in the detected language
- **Fallback System**: Graceful degradation if AI fails
- **Cultural Context**: Appropriate greetings and expressions

### 🛡️ **Spam Prevention**
- **Message Validation**: Filters inappropriate content
- **Length Limits**: 2-1000 character range
- **Pattern Detection**: Identifies spam patterns
- **Rate Limiting**: Prevents abuse

## Technical Implementation

### AI Agent Configuration
```typescript
// Located in: src/agent.ts
const groq = new Groq({
  apiKey: process.env.SQKEYS,
  dangerouslyAllowBrowser: true,
});

export async function EngageAgent(
  userMessage: string,
  onStream: StreamCallback,
) {
  const stream = await groq.chat.completions.create({
    messages: [...],
    stream: true,
    model: 'deepseek-r1-distill-llama-70b',
    temperature: 0.7,
    reasoning_format: 'hidden',
  });
}
```

### WhatsApp Integration
```typescript
// Enhanced generateAIResponse method
private async generateAIResponse(messageText: string, senderNumber: string): Promise<string | null> {
  try {
    // Use Groq AI for intelligent responses
    let fullResponse = '';
    
    await EngageAgent(messageText, (chunk: string) => {
      fullResponse += chunk;
    });
    
    // Add personalization if name is available
    if (userName && fullResponse && !fullResponse.toLowerCase().includes(userName.toLowerCase())) {
      // Insert name into greeting
      fullResponse = fullResponse.replace(/^(Hello|Hi)/, `$1 ${userName}`);
    }
    
    return fullResponse;
  } catch (error) {
    // Fallback to bilingual simple responses
    return this.getFallbackResponse(messageText, senderNumber);
  }
}
```

## Language Detection System

### Kiswahili Keywords
The system detects Kiswahili using these keywords:
```typescript
const swahiliKeywords = [
  'habari', 'hujambo', 'mambo', 'poa', 'sawa', 'asante', 'karibu', 'safari', 
  'utalii', 'ndege', 'hoteli', 'visa', 'bei', 'gharama', 'msaada', 'haya',
  'ndiyo', 'hapana', 'pole', 'baadaye', 'kesho', 'leo', 'jana', 'wiki',
  'mwezi', 'mwaka', 'siku', 'muda', 'haraka', 'polepole', 'vizuri', 'mbaya'
];
```

### Response Examples

**English Conversation:**
```
User: "Hi, I want to plan a trip to Zanzibar"
AI: "Hello! I'd be happy to help you plan your trip to Zanzibar! We offer luxury travel packages including flights, hotels, and guided tours. What dates are you considering?"
```

**Kiswahili Conversation:**
```
User: "Habari, nataka kupanga safari ya Zanzibar"
AI: "Hujambo! Nitafurahi kukusaidia kupanga safari yako ya Zanzibar! Tunauza vipaketi vya kifahari vya usafiri pamoja na ndege, hoteli, na safari za uongozaji. Ni tarehe gani unazozingatia?"
```

## Spam Prevention System

### Message Validation
```typescript
private isSpamMessage(message: string): boolean {
  const spamPatterns = [
    /(.)\1{4,}/g, // Repeated characters (5+ times)
    /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/g, // Only special characters
    /(free|win|winner|congratulations|prize|lottery|million|dollars|urgent|act now)/gi,
    /^(test|testing|hello){3,}$/gi, // Repeated test messages
  ];
  
  return spamPatterns.some(pattern => pattern.test(message));
}
```

### Protection Features
- **Length Validation**: 2-1000 characters
- **Spam Pattern Detection**: Identifies common spam formats
- **Repeated Character Filter**: Blocks messages with excessive repetition
- **Special Character Filter**: Prevents symbol-only messages
- **Keyword Detection**: Flags promotional spam content

## Environment Configuration

### Required Environment Variables
```bash
# .env file
SQKEYS=your_groq_api_key_here
ADMIN_WHATSAPP_NUMBERS=+1234567890,+0987654321
```

### API Key Setup
1. **Get Groq API Key**: Sign up at [Groq Console](https://console.groq.com/)
2. **Set Environment Variable**: Add `SQKEYS` to your `.env` file
3. **Verify Access**: Ensure API key has access to DeepSeek models

## AI Prompt Engineering

### System Prompt Structure
The AI agent is configured with:
- **Company Context**: Marmara Travel services and locations
- **Service Focus**: VISA, flights, hotels, tours, cargo services
- **Office Information**: Dubai, Dar Es Salaam, Zanzibar locations
- **Language Instructions**: Bilingual response requirements
- **Writing Style**: Professional, clear, actionable communication

### Response Guidelines
- **Warm Tone**: Personal and welcoming
- **Clear Language**: Simple, direct communication
- **Action-Oriented**: Practical next steps
- **Brand Consistent**: Maintains Marmara Travel voice
- **Culturally Appropriate**: Respects local customs

## Testing the Integration

### 1. **English Test Cases**
```bash
# Test travel inquiry
Send: "I want to book a flight to Dubai"
Expected: Intelligent response about flight booking services

# Test greeting
Send: "Hello, how are you?"
Expected: Warm welcome with service overview
```

### 2. **Kiswahili Test Cases**
```bash
# Test travel inquiry
Send: "Nataka kuhifadhi ndege kwenda Dubai"
Expected: Jibu la kijanja kuhusu huduma za uhifadhi wa ndege

# Test greeting
Send: "Habari, hujambo?"
Expected: Karibisha la joto na muhtasari wa huduma
```

### 3. **Spam Prevention Tests**
```bash
# Test repeated characters
Send: "helloooooooo"
Expected: Message ignored (logged as spam)

# Test promotional content
Send: "WIN FREE MONEY NOW!!!"
Expected: Message ignored (logged as spam)
```

## Performance Monitoring

### Logging Features
- **AI Response Times**: Track Groq API performance
- **Language Detection**: Monitor detection accuracy
- **Spam Filtering**: Log blocked messages
- **Fallback Usage**: Track when fallbacks are used
- **Error Handling**: Comprehensive error logging

### Metrics to Monitor
```typescript
// Key performance indicators
- Response time: < 3 seconds average
- Language detection accuracy: > 95%
- Spam filter effectiveness: > 99%
- AI availability: > 99.5%
- Fallback usage: < 5%
```

## Troubleshooting

### Common Issues

**AI Not Responding**
```bash
# Check API key
echo $SQKEYS

# Verify Groq service status
curl -H "Authorization: Bearer $SQKEYS" https://api.groq.com/openai/v1/models

# Check logs
tail -f logs/whatsapp.log | grep "AI response"
```

**Language Detection Issues**
```bash
# Test detection function
# Add debug logs to detectSwahili method
this.logger.debug(`Language detection for "${message}": ${isSwahili}`);
```

**Spam Filter Too Aggressive**
```bash
# Review spam patterns
# Adjust patterns in isSpamMessage method
# Monitor blocked message logs
```

### Error Recovery
- **Graceful Degradation**: Falls back to simple responses
- **Retry Logic**: Attempts Groq API multiple times
- **Error Logging**: Comprehensive error tracking
- **User Experience**: Always provides some response

## Security Considerations

### API Key Protection
- **Environment Variables**: Never hardcode API keys
- **Access Control**: Limit API key permissions
- **Rotation**: Regularly rotate API keys
- **Monitoring**: Track API usage and costs

### Data Privacy
- **Message Privacy**: Messages not stored permanently
- **User Data**: Minimal data collection
- **Compliance**: Follows data protection guidelines
- **Audit Trail**: Comprehensive logging for security

## Future Enhancements

### Planned Features
- **Advanced Context**: Multi-turn conversation memory
- **Sentiment Analysis**: Emotion-aware responses
- **Voice Messages**: Audio message support
- **Rich Media**: Image and document handling
- **Analytics Dashboard**: Performance metrics UI

### Integration Opportunities
- **CRM Integration**: Connect with customer database
- **Booking System**: Direct reservation capabilities
- **Payment Processing**: Integrated payment flows
- **Multi-channel**: Extend to other messaging platforms

This Groq AI integration transforms the WhatsApp service into an intelligent, bilingual assistant that provides professional travel support while maintaining security and preventing abuse.