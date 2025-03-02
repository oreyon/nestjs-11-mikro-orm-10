import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { Cloudinary } from './cloudinary';
import { CloudinaryController } from './cloudinary.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [CloudinaryService, Cloudinary],
  exports: [CloudinaryService],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}
