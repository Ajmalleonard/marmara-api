import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService as SecurityServiceModel } from './models/security-service.model';
import { SecurityTip, TipCategory } from './models/security-tip.model';
import { EmergencyContact } from './models/emergency-contact.model';

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService) {}

  async getSecurityServices(): Promise<SecurityServiceModel[]> {
    // In a real implementation, we would fetch from database
    // For now, we'll return a predefined list
    return [
      {
        id: '1',
        name: 'Security Personnel',
        description:
          'Professional security personnel available for private hire to accompany guests during their travels in Tanzania.',
        iconName: 'MdOutlineLocalPolice',
        price: 100,
      },
      {
        id: '2',
        name: '24/7 Emergency Assistance',
        description:
          'Round-the-clock emergency assistance for all our clients with direct access to local emergency services.',
        iconName: 'BsShieldCheck',
        price: 50,
      },
      {
        id: '3',
        name: 'Safety Briefings',
        description:
          'Comprehensive safety briefings provided to all guests, with location-specific advice for each destination.',
        iconName: 'MdOutlineHealthAndSafety',
        price: 25,
      },
    ];
  }

  async getSecurityTips(): Promise<SecurityTip[]> {
    // In a real implementation, we would fetch from database
    // For now, we'll return a predefined list
    return [
      {
        id: '1',
        title: 'Register with Embassy',
        description: "Register with your embassy's traveler program",
        category: TipCategory.BEFORE_TRIP,
        iconName: 'BsShieldCheck',
      },
      {
        id: '2',
        title: 'Travel Insurance',
        description: 'Purchase comprehensive travel insurance',
        category: TipCategory.BEFORE_TRIP,
        iconName: 'BsShieldCheck',
      },
      {
        id: '3',
        title: 'Document Copies',
        description: 'Make digital and physical copies of important documents',
        category: TipCategory.BEFORE_TRIP,
        iconName: 'BsShieldCheck',
      },
      {
        id: '4',
        title: 'Local Laws',
        description: 'Research local laws and customs',
        category: TipCategory.BEFORE_TRIP,
        iconName: 'BsShieldCheck',
      },
      {
        id: '5',
        title: 'Use Hotel Safes',
        description: 'Keep valuables in hotel safes',
        category: TipCategory.DURING_STAY,
        iconName: 'BsShieldCheck',
      },
      {
        id: '6',
        title: 'Official Transport',
        description: 'Use only official taxis or transportation',
        category: TipCategory.DURING_STAY,
        iconName: 'BsShieldCheck',
      },
      {
        id: '7',
        title: 'Avoid Displaying Valuables',
        description: 'Avoid displaying expensive items in public',
        category: TipCategory.DURING_STAY,
        iconName: 'BsShieldCheck',
      },
      {
        id: '8',
        title: 'Stay Connected',
        description: 'Stay connected with family or friends',
        category: TipCategory.DURING_STAY,
        iconName: 'BsShieldCheck',
      },
    ];
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    // In a real implementation, we would fetch from database
    // For now, we'll return a predefined list
    return [
      {
        id: '1',
        name: 'Police',
        phoneNumber: '111',
        iconName: 'MdOutlineLocalPolice',
      },
      {
        id: '2',
        name: 'Ambulance',
        phoneNumber: '112',
        iconName: 'MdOutlineLocalAmbulance',
      },
      {
        id: '3',
        name: 'Fire',
        phoneNumber: '114',
        iconName: 'MdOutlineLocalFireDepartment',
      },
      {
        id: '4',
        name: 'Marmara Holidays Emergency Hotline',
        phoneNumber: '+255 743 555 123',
        description: 'Our 24/7 emergency hotline for clients',
        iconName: 'BsShieldCheck',
      },
    ];
  }
}
