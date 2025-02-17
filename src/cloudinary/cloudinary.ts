import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

@Injectable()
export class Cloudinary {
  constructor(configService: ConfigService) {
    const config: ConfigOptions = {
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    };

    cloudinary.config(config);
  }

  getInstance(): typeof cloudinary {
    return cloudinary;
  }
}
