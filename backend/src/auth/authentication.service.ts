import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { UserRole } from '../usuarios/user-role.enum';
import { AuthenticatedUser } from './authenticated-user';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async authenticate(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .leftJoinAndSelect('usuario.mecanico', 'mecanico')
      .where('usuario.email = :email', { email: email.trim().toLowerCase() })
      .getOne();

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (
      usuario.rol === UserRole.MECANICO &&
      (!usuario.mecanico || !usuario.mecanico.activo)
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }
}
