import { Resolver, Query } from '@nestjs/graphql';
import { SecurityService } from './security.service';
import { SecurityService as SecurityServiceModel } from './models/security-service.model';
import { SecurityTip } from './models/security-tip.model';
import { EmergencyContact } from './models/emergency-contact.model';

@Resolver()
export class SecurityResolver {
  constructor(private securityService: SecurityService) {}

  @Query(() => [SecurityServiceModel], { name: 'securityServices' })
  async getSecurityServices(): Promise<SecurityServiceModel[]> {
    return this.securityService.getSecurityServices();
  }

  @Query(() => [SecurityTip], { name: 'securityTips' })
  async getSecurityTips(): Promise<SecurityTip[]> {
    return this.securityService.getSecurityTips();
  }

  @Query(() => [EmergencyContact], { name: 'emergencyContacts' })
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return this.securityService.getEmergencyContacts();
  }
}
