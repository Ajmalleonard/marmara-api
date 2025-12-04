import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class ChatMessage {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  sender: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
