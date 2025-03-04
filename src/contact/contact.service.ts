import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationService } from '../common/validation/validation.service';
import { ContactRepository } from './contact.repository';
import {
  EntityManager,
  EntityMetadata,
  MikroORM,
  QueryOrder,
} from '@mikro-orm/mysql';
import { User } from '../auth/entities/user.entity';
import {
  CreateContactRequest,
  CreateContactResponse,
  GetContactResponse,
  SearchContactReq,
  SearchContactRes,
  UpdateContactReq,
  UpdateContactRes,
} from './dto/contact.dto';
import { ContactValidation } from './contact.validation';
import { Contact } from './entities/contact.entity';
import { Paging } from '../model/web.model';

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

  async findOne(user: User, contactId: number): Promise<GetContactResponse> {
    this.logger.debug(`GET ONE CONTACT: ${JSON.stringify(contactId)}`);

    const contact: Contact | null = await this.contactRepository.findOne({
      id: contactId,
      user,
    });

    if (!contact) {
      throw new HttpException(`Contact not found`, 404);
    }

    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      image: contact.image,
    };
  }

  async update(
    user: User,
    request: UpdateContactReq,
  ): Promise<UpdateContactRes> {
    this.logger.debug(`UPDATE CONTACT: ${JSON.stringify(request)}`);

    const updateRequest: UpdateContactReq = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    const contact: Contact = await this.contactRepository.checkContactExists(
      user.id,
      updateRequest.id,
    );

    if (contact.user.id !== user.id) {
      throw new HttpException('Forbidden', 403);
    }

    contact.firstName = updateRequest.firstName as string;
    contact.lastName = updateRequest.lastName;
    contact.email = updateRequest.email;
    contact.phone = updateRequest.phone;
    contact.updatedAt = new Date();
    await this.em.persistAndFlush(contact);

    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      image: contact.image,
    };
  }

  async remove(user: User, contactId: number): Promise<boolean> {
    this.logger.debug(`DELETE CONTACT: ${JSON.stringify(contactId)}`);

    const contact = await this.contactRepository.checkContactExists(
      user.id,
      contactId,
    );

    if (contact.user.id !== user.id) {
      throw new HttpException('Forbidden', 403);
    }

    await this.contactRepository.nativeDelete({ id: contactId, user: user.id });
    await this.em.flush();

    return true;
  }

  async createMany(
    user: User,
    requests: CreateContactRequest[],
  ): Promise<CreateContactResponse[]> {
    this.logger.debug(`CREATE MANY CONTACTS: ${JSON.stringify(requests)}`);

    const createRequests: CreateContactRequest[] = requests.map(
      (request: CreateContactRequest): CreateContactRequest =>
        this.validationService.validate(ContactValidation.CREATE, request),
    );

    const contacts: Contact[] = createRequests.map(
      (request: CreateContactRequest): Contact =>
        this.contactRepository.create({
          ...request,
          updatedAt: new Date(),
          createdAt: new Date(),
          user,
        }),
    );

    await this.em.persistAndFlush(contacts);

    return contacts.map((contact: Contact) => {
      return {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
      };
    });
  }

  async searchContact(
    user: User,
    request: SearchContactReq,
  ): Promise<{ data: SearchContactRes[]; paging: Paging }> {
    this.logger.debug(`SEARCH CONTACT: ${JSON.stringify(request)}`);

    const search: SearchContactReq = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filters: any[] = [];

    if (search.username) {
      filters.push({
        $or: [
          { firstName: { $like: `%${search.username}%` } },
          { lastName: { $like: `%${search.username}%` } },
        ],
      });
    }

    if (search.email) {
      filters.push({ email: { $like: `%${search.email}%` } });
    }

    if (search.phone) {
      filters.push({ phone: { $like: `%${search.phone}%` } });
    }

    console.log('sortBy:', search.sortBy);
    console.log('orderBy:', search.orderBy);

    const metadata: EntityMetadata = this.orm.getMetadata().get(Contact.name);
    const validFields = Object.keys(metadata.properties);

    const defaultField = 'id';
    const sortFields = (search.sortBy || defaultField).split(',');
    const sortDirections = (search.orderBy || 'asc').split(',');

    const orderBy: Record<string, QueryOrder> = {};

    sortFields.forEach((field: string, index: number): void => {
      const direction: QueryOrder.ASC | QueryOrder.DESC =
        sortDirections[index]?.toLowerCase() === 'desc'
          ? QueryOrder.DESC
          : QueryOrder.ASC;

      if (validFields.includes(field)) {
        orderBy[field] = direction;
      } else {
        console.warn(`Invalid sortBy field: "${field}", skipping`);
      }
    });

    console.log(`Constructed orderBy:`, orderBy);
    const [contacts, totalContacts] = await this.contactRepository.findAndCount(
      {
        user: user.id,
        $and: filters,
      },
      {
        limit: search.size,
        offset: (Number(search.page) - 1) * Number(search.size),
        orderBy: orderBy,
      },
    );

    const data = contacts.map((contact: Contact) => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      image: contact.image,
    }));

    const totalCountPage: number = Math.ceil(
      totalContacts / Number(search.size),
    );

    return {
      data,
      paging: {
        currentPage: Number(search.page),
        size: Number(search.size),
        totalPage: totalCountPage,
      },
    };
  }
}
