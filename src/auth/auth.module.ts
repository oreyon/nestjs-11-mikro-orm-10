import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { NodemailerModule } from '../nodemailer/nodemailer.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    NodemailerModule,
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
