import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { ChatMessage } from './chat-message.model';

@ObjectType()
export class Chat {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => [ChatMessage])
  messages: ChatMessage[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
