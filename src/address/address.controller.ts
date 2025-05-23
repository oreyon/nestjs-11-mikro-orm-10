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
import {
  CreateAddressReq,
  CreateAddressRes,
  GetAddressReq,
  GetAddressRes,
  RemoveAddressReq,
  UpdateAddressReq,
  UpdateAddressRes,
} from './dto/address.dto';
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

  @ApiOperation({ summary: 'Get all addresses' })
  @HttpCode(200)
  @Get()
  async findAll(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<GetAddressRes[]>> {
    const result: GetAddressRes[] = await this.addressService.findAll(
      user,
      contactId,
    );

    return {
      message: 'Success get all addresses',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Find address by id' })
  @HttpCode(200)
  @Get(':addressId')
  async findOne(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<GetAddressRes>> {
    const request: GetAddressReq = {
      contactId: contactId,
      addressId: addressId,
    };

    const result: GetAddressRes = await this.addressService.findOne(
      user,
      request,
    );
    return {
      message: 'Success find address',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Update address by id' })
  @HttpCode(200)
  @Patch(':addressId')
  async update(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() request: UpdateAddressReq,
  ): Promise<WebResponse<UpdateAddressRes>> {
    request.contactId = contactId;
    request.id = addressId;

    const result: UpdateAddressRes = await this.addressService.update(
      user,
      request,
    );

    return {
      message: 'Success update address',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Remove address by id' })
  @HttpCode(204)
  @Delete(':addressId')
  async remove(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<boolean>> {
    const request: RemoveAddressReq = {
      contactId: contactId,
      addressId: addressId,
    };

    const result: boolean = await this.addressService.remove(user, request);

    return {
      message: 'Success remove address',
      data: result,
    };
  }
}
