import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get('status')
  getConnectionStatus() {
    return {
      connected: this.whatsAppService.getConnectionStatus(),
      timestamp: new Date().toISOString()
    };
  }

  @Post('send-message')
  async sendMessage(@Body() body: { phoneNumber: string; message: string }) {
    const success = await this.whatsAppService.sendMessage(body.phoneNumber, body.message);
    return { success, timestamp: new Date().toISOString() };
  }

  @Post('human-takeover/:conversationId')
  async resumeAIControl(@Param('conversationId') conversationId: string) {
    await this.whatsAppService.resumeAIControl(conversationId);
    return { 
      success: true, 
      message: 'AI control resumed',
      conversationId,
      timestamp: new Date().toISOString() 
    };
  }

  @Get('conversations/:phoneNumber/status')
  async getConversationStatus(@Param('phoneNumber') phoneNumber: string) {
    // This would require a new method in the service to get conversation status
    return { 
      phoneNumber,
      message: 'Conversation status endpoint - implement in service if needed',
      timestamp: new Date().toISOString() 
    };
  }
}