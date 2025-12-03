
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ChatService } from './chat.service';

@Resolver('Chat')
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query()
  async getChat(@Args('id') id: string) {
    return this.chatService.getChat(id);
  }

  @Mutation()
  async createChat(@Args('name') name: string, @Args('email') email: string) {
    return this.chatService.createChat(name, email);
  }

  @Mutation()
  async sendMessage(
    @Args('chatId') chatId: string,
    @Args('content') content: string,
    @Args('sender') sender: string,
  ) {
    return this.chatService.sendMessage(chatId, content, sender);
  }
}
