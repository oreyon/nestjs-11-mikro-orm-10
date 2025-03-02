import { ApiProperty } from '@nestjs/swagger';

export class RemoveMediaRequest {
  @ApiProperty({
    description: 'Secure URL of the media',
    format: 'url of the media',
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/medium',
  })
  secureUrl: string;
}
