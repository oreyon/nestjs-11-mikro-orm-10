import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import {
  CreateContactRequest,
  CreateContactResponse,
  GetContactResponse,
  UpdateContactReq,
  UpdateContactRes,
} from './dto/contact.dto';
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
      message: 'Success create contact',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get contact by id' })
  @HttpCode(200)
  @Get(':contactId')
  async findOne(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<GetContactResponse>> {
    const result: GetContactResponse = await this.contactService.findOne(
      user,
      contactId,
    );

    return {
      message: 'Success get contact',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Update a contact' })
  @HttpCode(200)
  @Patch(':contactId')
  async update(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: UpdateContactReq,
  ): Promise<WebResponse<UpdateContactRes>> {
    request.id = contactId;
    const result: UpdateContactRes = await this.contactService.update(
      user,
      request,
    );

    return {
      message: 'Success update contact',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Delete a contact' })
  @HttpCode(204)
  @Delete(':contactId')
  async remove(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<boolean>> {
    const result: boolean = await this.contactService.remove(user, contactId);

    return {
      message: 'Success delete contact',
      data: result,
    };
  }
}
