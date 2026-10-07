import { UserRole } from '../usuarios/user-role.enum';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
