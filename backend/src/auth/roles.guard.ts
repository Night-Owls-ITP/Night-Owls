import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from './authenticated-user';
import { ROLES_METADATA_KEY } from './roles.decorator';
import { UserRole } from '../usuarios/user-role.enum';
import { IS_PUBLIC_METADATA_KEY } from './public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = request.user?.rol;

    if (role === UserRole.ADMINISTRADOR) {
      return true;
    }
    if (!roles || !role || !roles.includes(role)) {
      throw new ForbiddenException('No tiene permiso para este recurso');
    }
    return true;
  }
}
