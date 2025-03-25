import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { AddressRepository } from '../address.repository';
import { Contact } from '../../contact/entities/contact.entity';

@Entity({
  tableName: 'addresses',
  repository: (): typeof AddressRepository => AddressRepository,
})
export class Address {
  [EntityRepositoryType]?: AddressRepository;

  constructor(
    country: string,
    street?: string,
    city?: string,
    province?: string,
    postalCode?: string,
  ) {
    this.country = country;
    this.street = street;
    this.city = city;
    this.province = province;
    this.postalCode = postalCode;
  }

  @PrimaryKey()
  id!: number;

  @Property({ length: 255, nullable: true })
  street?: string;

  @Property({ length: 100, nullable: true })
  city?: string;

  @Property({ length: 100, nullable: true })
  province?: string;

  @Property({ length: 100 })
  country!: string;

  @Property({ length: 10, nullable: true })
  postalCode?: string;

  @ManyToOne((): typeof Contact => Contact)
  contact!: Contact;

  @Property({
    onCreate: (): Date => new Date(),
    columnType: 'datetime',
  })
  createdAt: Date = new Date();

  @Property({
    onCreate: (): Date => new Date(),
    onUpdate: (): Date => new Date(),
    columnType: 'datetime',
  })
  updatedAt: Date = new Date();

  @Property({
    columnType: 'datetime',
    nullable: true,
  })
  deletedAt?: Date;
}
