import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class EmergencyContact {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  phoneNumber: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  iconName?: string;
}
