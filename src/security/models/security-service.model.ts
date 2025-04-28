import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class SecurityService {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  iconName: string;

  @Field({ nullable: true })
  price?: number;
}
