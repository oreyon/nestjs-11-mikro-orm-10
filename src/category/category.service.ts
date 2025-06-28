import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Category } from './entities/category.entity';
import { EntityRepository, LoadStrategy } from '@mikro-orm/mysql';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: EntityRepository<Category>,
  ) {}

  // async create(createCategoryDto: CreateCategoryDto) {
  //   return await 'This action adds a new category';
  // }

  async findAll() {
    const result = await this.categoryRepository.findAll({
      where: {
        parent: null,
      },
      populate: ['children'],
      strategy: LoadStrategy.SELECT_IN,
    });

    const mappedResult = result.map((c: Category) => ({
      id: c.id,
      name: c.name,
      children: c.children.map((child) => ({
        id: child.id,
        name: child.name,
      })),
    }));

    return mappedResult;
  }

  // async findOne(id: number) {
  //   return await `This action returns a #${id} category`;
  // }
  //
  // async update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return await `This action updates a #${id} category`;
  // }
  //
  // async remove(id: number) {
  //   return await `This action removes a #${id} category`;
  // }
}
