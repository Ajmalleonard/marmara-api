import { Field, ObjectType, ID } from '@nestjs/graphql';

export enum TipCategory {
  BEFORE_TRIP = 'BEFORE_TRIP',
  DURING_STAY = 'DURING_STAY',
  EMERGENCY = 'EMERGENCY',
}

@ObjectType()
export class SecurityTip {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field()
  iconName: string;
}
