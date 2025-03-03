import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactRequest, CreateContactResponse } from './dto/contact.dto';
import { AccessTokenGuard } from '../common/guards';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserData } from '../common/decorators';
import { User } from '../auth/entities/user.entity';
import { WebResponse } from '../model/web.model';

@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@ApiTags('Contact')
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @ApiOperation({ summary: 'Create a new contact' })
  @HttpCode(201)
  @Post()
  async create(
    @UserData() user: User,
    @Body() request: CreateContactRequest,
  ): Promise<WebResponse<CreateContactResponse>> {
    const result: CreateContactResponse = await this.contactService.create(
      user,
      request,
    );

    return {
      message: 'Success create a contact',
      data: result,
    };
  }
}
