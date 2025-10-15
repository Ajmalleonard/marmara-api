import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WhatsAppJsService } from './whatsappjs.service';


@Controller('whatsappjs')
export class WhatsAppJsController {
  constructor(private readonly service: WhatsAppJsService) {}

  @Get('status')
  status() {
    return {
      connected: this.service.getConnectionStatus(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('qr')
  qr() {
    return {
      instance: process.env.WHATSAPP_JS_INSTANCE_NAME || 'WhatsApp-web.js',
      qr: this.service.getLastQr(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('force-qr')
  async forceQr() {
    await this.service.forceReauth();
    return { success: true, message: 'QR will be regenerated', timestamp: new Date().toISOString() };
  }

  @Post('send-message')
  async sendMessage(@Body() body: { phoneNumber: string; message: string }) {
    const ok = await this.service.sendMessage(body.phoneNumber, body.message);
    return { success: ok, timestamp: new Date().toISOString() };
  }

  @Post('human-takeover/:conversationId')
  async resumeAIControl(@Param('conversationId') conversationId: string) {
    await this.service.resumeAIControl(conversationId);
    return { 
      success: true, 
      message: 'AI control resumed',
      conversationId,
      timestamp: new Date().toISOString() 
    };
  }

  @Get('conversations/:phoneNumber/status')
  async getConversationStatus(@Param('phoneNumber') phoneNumber: string) {
    return { 
      phoneNumber,
      message: 'Conversation status endpoint - implement in service if needed',
      timestamp: new Date().toISOString() 
    };
  }
}