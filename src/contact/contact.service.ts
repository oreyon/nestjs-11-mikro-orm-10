import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../common/validation/validation.service';
import { ContactRepository } from './contact.repository';
import { EntityManager, MikroORM } from '@mikro-orm/mysql';
import { User } from '../auth/entities/user.entity';
import { CreateContactRequest, CreateContactResponse } from './dto/contact.dto';
import { ContactValidation } from './contact.validation';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
    private readonly contactRepository: ContactRepository,
    private em: EntityManager,
    private orm: MikroORM,
  ) {}

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<CreateContactResponse> {
    this.logger.debug(`CREATE CONTACT: ${JSON.stringify(request)}`);

    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );

    const contact: Contact = this.contactRepository.create({
      firstName: createRequest.firstName,
      lastName: createRequest.lastName,
      email: createRequest.email,
      phone: createRequest.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: user,
    });

    await this.em.persistAndFlush(contact);

    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
    };
  }

  findAll() {
    return `This action returns all contact`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
