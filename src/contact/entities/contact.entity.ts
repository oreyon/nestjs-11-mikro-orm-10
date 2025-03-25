import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ContactRepository } from '../contact.repository';
import { User } from '../../auth/entities/user.entity';
import { Address } from '../../address/entities/address.entity';

@Entity({
  tableName: 'contacts',
  repository: (): typeof ContactRepository => ContactRepository,
})
export class Contact {
  [EntityRepositoryType]?: ContactRepository;

  constructor(
    firstName: string,
    lastName?: string,
    email?: string,
    phone?: string,
    image?: string,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.image = image;
  }

  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  firstName!: string;

  @Property({ length: 100, nullable: true })
  lastName?: string;

  @Property({ length: 100, nullable: true })
  email?: string;

  @Property({ length: 20, nullable: true })
  phone?: string;

  @Property({ nullable: true })
  image?: string;

  @ManyToOne((): typeof User => User)
  user!: User;

  @OneToMany(
    (): typeof Address => Address,
    (address: Address): Contact => address.contact,
  )
  address: Collection<Address> = new Collection<Address>(this);

  @Property({ type: 'datetime', onUpdate: (): Date => new Date() })
  updatedAt: Date = new Date();

  @Property({ type: 'datetime', onCreate: (): Date => new Date() })
  createdAt: Date = new Date();

  @Property({
    columnType: 'datetime',
    nullable: true,
  })
  deletedAt?: Date;
}
