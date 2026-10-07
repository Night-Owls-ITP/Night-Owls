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

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
