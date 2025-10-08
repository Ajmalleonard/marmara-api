# AI WhatsApp Message Detection & Response

## Overview

The WhatsApp service now includes AI-powered message detection and automatic response capabilities. When users send messages to your WhatsApp business number, the system will automatically detect and respond with contextually relevant information.

## How It Works

### 1. Message Detection
- The system listens for incoming WhatsApp messages using the `messages.upsert` event
- Only processes messages that are:
  - Not sent by the business account (not from you)
  - Text messages (conversation type)
  - From real users

### 2. AI Response Generation
The system includes intelligent keyword detection and contextual responses:

#### Travel-Related Queries
- **Keywords**: "trip", "travel", "vacation"
- **Response**: Offers to help with trip planning and directs to website

#### Greetings
- **Keywords**: "hello", "hi", "hey"
- **Response**: Friendly welcome message introducing Marmara Travel

#### Pricing Inquiries
- **Keywords**: "price", "cost", "budget"
- **Response**: Information about customized packages and quote process

#### Help Requests
- **Keywords**: "help", "support"
- **Response**: Menu of available assistance options

#### Default Response
- For unrecognized messages, provides a helpful default response introducing the AI assistant

### 3. Automatic Reply
- Responses are sent automatically to the user
- All interactions are logged for monitoring
- Error handling ensures system stability

## Features

### Smart Keyword Detection
- Case-insensitive keyword matching
- Multiple keyword support per category
- Contextual travel industry responses

### Professional Responses
- Branded responses with emojis
- Clear call-to-actions
- Helpful information structure

### Logging & Monitoring
- All incoming messages are logged
- Response generation is tracked
- Error handling with fallback messages

## Customization Options

### 1. Advanced AI Integration
You can enhance the AI responses by integrating with external AI services:

```typescript
// Example: OpenAI Integration
private async generateAdvancedAIResponse(messageText: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful travel assistant for Marmara Travel..."
      },
      {
        role: "user",
        content: messageText
      }
    ]
  });
  
  return response.choices[0].message.content;
}
```

### 2. Database Integration
Store conversations for analytics and improvement:

```typescript
// Example: Save conversation to database
await this.prisma.conversation.create({
  data: {
    phoneNumber: senderNumber,
    userMessage: messageText,
    aiResponse: aiResponse,
    timestamp: new Date()
  }
});
```

### 3. Business Hours
Add business hours logic:

```typescript
private isBusinessHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 9 && hour <= 18; // 9 AM to 6 PM
}
```

## Security & Privacy

### Message Privacy
- Messages are processed in real-time
- No permanent storage of message content (unless explicitly implemented)
- Secure WhatsApp encryption maintained

### Rate Limiting
- Built-in spam prevention for admin notifications
- Consider adding rate limiting for AI responses if needed

### Data Protection
- Only processes text messages
- No access to media files or personal data beyond phone numbers
- Compliant with WhatsApp Business API terms

## Testing

### Manual Testing
1. Send a test message to your WhatsApp business number
2. Check server logs for message detection
3. Verify AI response is sent back
4. Test different keyword categories

### Monitoring
- Check logs for `Received message from` entries
- Monitor `Sent AI response to` confirmations
- Watch for any error messages in the logs

## Troubleshooting

### Common Issues

1. **Messages not detected**
   - Ensure WhatsApp is connected (check QR code scan)
   - Verify message is text-based (not media)
   - Check if message is from the business account itself

2. **No AI responses**
   - Check server logs for errors
   - Verify `handleIncomingMessage` is being called
   - Ensure `sendMessage` function is working

3. **Delayed responses**
   - Check server performance
   - Monitor for any blocking operations
   - Consider async processing for complex AI calls

### Debug Mode
Enable detailed logging by modifying the logger level in the WhatsApp service initialization.

## Future Enhancements

- Integration with OpenAI/Claude for more sophisticated responses
- Conversation context memory
- Multi-language support
- Business hours awareness
- Conversation analytics dashboard
- Custom response templates via admin panel