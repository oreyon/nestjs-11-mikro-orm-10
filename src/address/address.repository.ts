import { EntityRepository } from '@mikro-orm/mysql';
import { Address } from './entities/address.entity';
import { HttpException } from '@nestjs/common';

export class AddressRepository extends EntityRepository<Address> {
  async checkAddressExist(contactId: number, addressId: number) {
    const address = await this.findOne({
      contact: contactId,
      id: addressId,
    });

    if (!address) {
      throw new HttpException('Address not found', 404);
    }

    return address;
  }
}
