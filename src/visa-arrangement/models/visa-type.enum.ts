import { Field, ObjectType, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class VisaType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;
}
