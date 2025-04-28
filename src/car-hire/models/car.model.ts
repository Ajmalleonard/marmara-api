import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Car {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field(() => Float)
  price: number;

  @Field()
  image: string;

  @Field(() => Int)
  seats: number;

  @Field()
  transmission: string;

  @Field()
  airCon: boolean;

  @Field()
  engine: string;

  @Field(() => [String])
  features: string[];
}
