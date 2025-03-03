import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactRequest {
  @ApiProperty({
    description: 'First name of the contact',
    format: 'text',
    example: 'John',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: 'Last name of the contact',
    format: 'text',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email of the contact',
    format: 'email',
    example: 'example@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the contact',
    format: 'text',
    example: '08123456789',
  })
  phone?: string;
}

export class CreateContactResponse {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
}

export class GetContactResponse {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
}

export class UpdateContactReq {
  @ApiProperty({
    description: 'Contact ID',
    format: 'number',
    example: 1,
  })
  id: number;

  @ApiPropertyOptional({
    description: 'First name of the contact',
    format: 'text',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the contact',
    format: 'text',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email of the contact',
    format: 'email',
    example: 'updateexample@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the contact',
    format: 'text',
    example: '08123456789',
  })
  phone?: string;
}

export class UpdateContactRes {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
}

export class SearchContactReq {
  @ApiPropertyOptional({
    description: 'Username to filter contacts',
    format: 'text',
    example: 'johndoe',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Email to filter contacts',
    format: 'email',
    example: 'example@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number to filter contacts',
    format: 'text',
    example: '08123456789',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    format: 'number',
    example: 1,
  })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Page size for pagination',
    format: 'number',
    example: 10,
  })
  size?: number = 10;

  @ApiPropertyOptional({
    description: 'Sorting field and direction',
    format: 'string',
    example: 'id/email',
  })
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Filter contacts by created date',
    format: 'string',
    example: 'asc/desc/asc,desc',
  })
  orderBy?: string;
}

export class SearchContactRes {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
}
