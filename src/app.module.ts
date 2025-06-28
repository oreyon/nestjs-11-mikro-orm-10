import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MikroModule } from './mikro/mikro.module';
import { ConfigModule } from '@nestjs/config';
// import { ThrottlerModule } from '@nestjs/throttler';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import { MikroService } from './mikro/mikro.service';
import { CommonModule } from './common/common.module';
import { NodemailerModule } from './nodemailer/nodemailer.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { AddressModule } from './address/address.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000, // in milliseconds (60 seconds)
    //     limit: 60, // limit each IP to 60 requests per ttl
    //   },
    // ]),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   serveRoot: '/uploads',
    // }),
    MikroModule,
    CommonModule,
    AuthModule,
    NodemailerModule,
    CloudinaryModule,
    ContactModule,
    AddressModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [
    MikroService,
    // {
    //   provide: 'APP_GUARD',
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
