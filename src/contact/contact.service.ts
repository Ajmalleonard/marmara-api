import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import {
  sendAdminContactEmail,
  sendClientContactConfirmationEmail,
} from 'src/emails/emails';

@Injectable()
export class ContactService {
  async MarmaratravelCase(createContactDto: CreateContactDto) {
    await sendAdminContactEmail(createContactDto);

    const CaseRef = Math.random().toString(36).substring(2, 8).toUpperCase();
    await sendClientContactConfirmationEmail(createContactDto.email, CaseRef);
    return 'This action adds a new contact';
  }

  findAll() {
    return `This action returns all contact`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
