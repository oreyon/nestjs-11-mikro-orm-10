import { Inject, Injectable } from '@nestjs/common';
import {
  CreateAddressReq,
  CreateAddressRes,
  GetAddressRes,
} from './dto/address.dto';
import { User } from '../auth/entities/user.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { EntityManager } from '@mikro-orm/mysql';
import { ValidationService } from '../common/validation/validation.service';
import { ContactRepository } from '../contact/contact.repository';
import { AddressRepository } from './address.repository';
import { AddressValidation } from './address.validation';
import { Contact } from '../contact/entities/contact.entity';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private readonly contactRepository: ContactRepository,
    private readonly addressRepository: AddressRepository,
    private em: EntityManager,
  ) {}
  async create(
    user: User,
    request: CreateAddressReq,
  ): Promise<CreateAddressRes> {
    this.logger.debug(`CREATE ADDRESS: ${JSON.stringify(request)}`);

    const createRequest: CreateAddressReq = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    const checkContact: Contact =
      await this.contactRepository.checkContactExists(
        user.id,
        createRequest.contactId,
      );

    const address: Address = this.addressRepository.create({
      contact: checkContact,
      ...createRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(address);

    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postalCode: address.postalCode,
    };
  }

  async findAll(user: User, contactId: number): Promise<GetAddressRes[]> {
    this.logger.debug(`GET ALL ADDRESSES: ${contactId}`);

    const contact: Contact = await this.contactRepository.checkContactExists(
      user.id,
      contactId,
    );

    const addresses: Address[] = await this.addressRepository.find({
      contact: contact.id,
    });

    return addresses.map((address: Address) => {
      return {
        id: address.id,
        street: address.street,
        city: address.city,
        province: address.province,
        country: address.country,
        postalCode: address.postalCode,
      };
    });
  }
}
