import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Contact])],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
