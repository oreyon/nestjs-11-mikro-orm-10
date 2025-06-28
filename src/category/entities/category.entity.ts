import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';

@Entity({ tableName: 'categories' })
export class Category {
  @PrimaryKey({ type: 'string' })
  id!: string;

  @Property({ length: 255 })
  name!: string;

  @ManyToOne(() => Category, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children = new Collection<Category>(this);
}
