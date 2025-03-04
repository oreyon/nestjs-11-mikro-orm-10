import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards';
import { UserData } from '../common/decorators';
import { User } from '../auth/entities/user.entity';
import { CreateAddressReq, CreateAddressRes } from './dto/address.dto';
import { WebResponse } from '../model/web.model';

@ApiTags('Address')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('contacts/:contactId/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: 'Create new address' })
  @HttpCode(201)
  @Post()
  async create(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: CreateAddressReq,
  ): Promise<WebResponse<CreateAddressRes>> {
    request.contactId = contactId;
    const result: CreateAddressRes = await this.addressService.create(
      user,
      request,
    );

    return {
      message: 'Success create address',
      data: result,
    };
  }
}
