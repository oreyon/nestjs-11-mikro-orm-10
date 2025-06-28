import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // @Post()
  // async create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return await this.categoryService.create(createCategoryDto);
  // }

  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return await this.categoryService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ) {
  //   return await this.categoryService.update(+id, updateCategoryDto);
  // }
  //
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.categoryService.remove(+id);
  // }
}
