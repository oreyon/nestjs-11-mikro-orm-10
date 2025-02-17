import { Global, Module } from '@nestjs/common';
import { ValidationService } from './validation/validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './errors';
import { JwtService } from './jwt/jwt.service';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';

@Global()
@Module({
  providers: [
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    JwtService,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [ValidationService, JwtService, AccessTokenGuard, RefreshTokenGuard],
})
export class CommonModule {}
