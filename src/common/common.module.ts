import { Global, Module } from '@nestjs/common';
import { ValidationService } from './validation/validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './errors';
import { JwtService } from './jwt/jwt.service';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../auth/entities/user.entity';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    JwtService,
    AccessTokenGuard,
    RefreshTokenGuard,
    RolesGuard,
  ],
  exports: [
    ValidationService,
    JwtService,
    AccessTokenGuard,
    RefreshTokenGuard,
    RolesGuard,
  ],
})
export class CommonModule {}
