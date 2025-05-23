import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Unique,
  EntityRepositoryType,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { UserRepository } from '../user.repository';
import { Contact } from '../../contact/entities/contact.entity';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity({
  tableName: 'users',
  repository: (): typeof UserRepository => UserRepository,
})
export class User {
  [EntityRepositoryType]?: UserRepository;

  // constructor(email: string, username: string, password: string, role: Role) {
  //   this.email = email;
  //   this.username = username;
  //   this.password = password;
  //   this.role = role;
  // }

  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  email!: string;

  @Property({ length: 100 })
  @Unique()
  username!: string;

  @Property({ length: 100 })
  password!: string;

  @Enum({ items: (): typeof Role => Role, default: Role.USER })
  role: Role = Role.USER;
  // use this if you want to set the default role to USER instead of constructor
  // role: Role = Role.USER;

  @Property({ nullable: true })
  image?: string;

  @Property({ length: 255, nullable: true })
  refreshToken?: string;

  @Property({ default: false })
  isVerified: boolean = false;

  @Property({ nullable: true, columnType: 'datetime' })
  verifiedTime?: Date;

  @Property({ length: 255, nullable: true })
  emailVerificationToken?: string;

  @Property({ length: 255, nullable: true })
  passwordResetToken?: string;

  @Property({ nullable: true, columnType: 'datetime' })
  passwordResetTokenExpirationTime?: Date;

  @Property({
    onCreate: () => new Date(),
    columnType: 'datetime',
  })
  createdAt: Date = new Date();

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: 'datetime',
  })
  updatedAt: Date = new Date();

  @Property({
    columnType: 'datetime',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToMany(
    (): typeof Contact => Contact,
    (contact: Contact): User => contact.user,
  )
  contacts: Collection<Contact> = new Collection<Contact>(this);
}
