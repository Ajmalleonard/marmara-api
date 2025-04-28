import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { VisaArrangementService } from './visa-arrangement.service';
import { VisaRequest } from './models/visa-request.model';
import { VisaType } from './models/visa-type.enum';
import { CreateVisaRequestInput } from './dto/create-visa-request.input';

@Resolver(() => VisaRequest)
export class VisaArrangementResolver {
  constructor(private visaArrangementService: VisaArrangementService) {}

  @Mutation(() => VisaRequest)
  async createVisaRequest(
    @Args('createVisaRequestInput')
    createVisaRequestInput: CreateVisaRequestInput,
  ): Promise<VisaRequest> {
    return this.visaArrangementService.submitVisaRequest(
      createVisaRequestInput,
    );
  }

  @Query(() => [VisaType], { name: 'visaTypes' })
  async getVisaTypes(): Promise<VisaType[]> {
    return this.visaArrangementService.getVisaTypes();
  }
}
