import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { UserRole } from '../usuarios/user-role.enum';
import { AuthenticatedUser } from './authenticated-user';

interface JwtPayload {
  sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret?.trim()) {
      throw new Error('JWT_SECRET must be configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!Number.isSafeInteger(payload?.sub) || payload.sub <= 0) {
      throw new UnauthorizedException('Token inválido');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
      relations: { mecanico: true },
    });
    if (
      !usuario ||
      !usuario.activo ||
      (usuario.rol === UserRole.MECANICO &&
        (!usuario.mecanico || !usuario.mecanico.activo))
    ) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }
}
