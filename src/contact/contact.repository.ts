import { EntityRepository } from '@mikro-orm/mysql';
import { Contact } from './entities/contact.entity';
import { HttpException } from '@nestjs/common';

export class ContactRepository extends EntityRepository<Contact> {
  async checkContactExists(
    userId: number,
    contactId: number,
  ): Promise<Contact> {
    const contact: Contact | null = await this.findOne({
      id: contactId,
      user: userId,
    });

    if (!contact) {
      throw new HttpException(`Contact with id ${contactId} not found`, 404);
    }

    return contact;
  }
}
