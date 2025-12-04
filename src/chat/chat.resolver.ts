
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Subscription,
} from '@nestjs/graphql';
import { Logger, Inject } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './models/chat.model';
import { ChatMessage } from './models/chat-message.model';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => Chat)
export class ChatResolver {
  private readonly logger = new Logger(ChatResolver.name);
  constructor(
    private readonly chatService: ChatService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => Chat, { name: 'getChat' })
  async getChat(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Chat | null> {
    this.logger.log(`getChat start ${id}`);
    const result = await this.chatService.getChat(id);
    this.logger.log(
      `getChat done ${id} messages=${result?.messages?.length ?? 0}`,
    );
    return result;
  }

  @Mutation(() => Chat, { name: 'createChat' })
  async createChat(
    @Args('name') name: string,
    @Args('email') email: string,
  ): Promise<Chat> {
    this.logger.log(`createChat start ${name} ${email}`);
    const result = await this.chatService.createChat(name, email);
    this.logger.log(`createChat done ${result.id}`);
    return result;
  }

  @Mutation(() => ChatMessage, { name: 'sendMessage' })
  async sendMessage(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('content') content: string,
    @Args('sender') sender: string,
  ): Promise<ChatMessage> {
    this.logger.log(
      `sendMessage start chatId=${chatId} sender=${sender} len=${content.length}`,
    );
    const result = await this.chatService.sendMessage(chatId, content, sender);
    await this.pubSub.publish('messageAdded', { messageAdded: result, chatId });
    this.logger.log(`sendMessage done ${result.id}`);
    return result;
  }

  @Subscription(() => ChatMessage, {
    name: 'messageAdded',
    filter: (payload: any, variables: any) =>
      payload.chatId === variables.chatId,
    resolve: (payload: any) => payload.messageAdded,
  })
  messageAdded(@Args('chatId', { type: () => ID }) chatId: string) {
    return (this.pubSub as any).asyncIterator('messageAdded');
  }
}
