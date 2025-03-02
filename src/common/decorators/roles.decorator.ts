import { SetMetadata } from '@nestjs/common';
import { Role } from '../../auth/entities/user.entity';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
