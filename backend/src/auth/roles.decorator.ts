import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../usuarios/user-role.enum';

export const ROLES_METADATA_KEY = 'authorized_roles';

export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_METADATA_KEY, roles);
