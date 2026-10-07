import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { lanzarConflictoDeIntegridad } from '../common/database-errors';
import { Mecanico } from '../mecanicos/mecanico.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './usuario.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Mecanico)
    private readonly mecanicoRepository: Repository<Mecanico>,
  ) {}

  async crear(datos: CreateUsuarioDto): Promise<Omit<Usuario, 'passwordHash'>> {
    const email = this.normalizarEmail(datos.email);
    const existente = await this.usuarioRepository.findOne({ where: { email } });
    if (existente) {
      throw new ConflictException('El email ya está registrado');
    }
    if (!datos.password || datos.password.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    const mecanico = await this.validarVinculoMecanico(
      datos.rol,
      datos.mecanicoId,
    );
    const passwordHash = await bcrypt.hash(datos.password, 10);
    const usuario = this.usuarioRepository.create({
      nombre: datos.nombre,
      email,
      passwordHash,
      rol: datos.rol,
      activo: datos.activo ?? true,
      mecanico,
    });
    let creado: Usuario;
    try {
      creado = await this.usuarioRepository.save(usuario);
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
    const { passwordHash: _passwordHash, ...respuesta } = creado as Usuario & {
      passwordHash: string;
    };
    return respuesta;
  }

  async obtenerTodos(): Promise<Omit<Usuario, 'passwordHash'>[]> {
    const usuarios = await this.usuarioRepository.find();
    return usuarios.map(({ passwordHash: _passwordHash, ...usuario }) => usuario);
  }

  async obtenerPorId(id: number): Promise<Omit<Usuario, 'passwordHash'>> {
    this.validarId(id);
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const { passwordHash: _passwordHash, ...respuesta } = usuario;
    return respuesta;
  }

  obtenerRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  async actualizar(id: number, datos: UpdateUsuarioDto): Promise<Omit<Usuario, 'passwordHash'>> {
    this.validarId(id);
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { mecanico: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (datos.email !== undefined) {
      const email = this.normalizarEmail(datos.email);
      const duplicado = await this.usuarioRepository.findOne({ where: { email } });
      if (duplicado && duplicado.id !== id) {
        throw new ConflictException('El email ya está registrado');
      }
      usuario.email = email;
    }

    if (datos.nombre !== undefined) {
      usuario.nombre = datos.nombre;
    }

    if (datos.rol !== undefined) {
      usuario.rol = datos.rol;
    }

    if (datos.activo !== undefined) {
      usuario.activo = datos.activo;
    }

    const rolFinal = datos.rol ?? usuario.rol;
    if (datos.mecanicoId !== undefined) {
      usuario.mecanico =
        datos.mecanicoId === null
          ? null
          : await this.validarMecanicoActivo(datos.mecanicoId, usuario.id);
    }
    if (
      rolFinal === UserRole.MECANICO &&
      (!usuario.mecanico || !usuario.mecanico.activo)
    ) {
      throw new BadRequestException(
        'Un usuario con rol mecanico debe vincularse a un mecánico activo',
      );
    }

    if (datos.password !== undefined) {
      if (datos.password.length < 8) {
        throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
      }
      usuario.passwordHash = await bcrypt.hash(datos.password, 10);
    }

    let actualizado: Usuario;
    try {
      actualizado = await this.usuarioRepository.save(usuario);
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
    const { passwordHash: _passwordHash, ...respuesta } = actualizado;
    return respuesta;
  }

  async eliminar(id: number): Promise<{ message: string }> {
    this.validarId(id);
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);
    return { message: 'Usuario desactivado correctamente' };
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async validarVinculoMecanico(
    rol: UserRole,
    mecanicoId?: number,
  ): Promise<Mecanico | null> {
    if (mecanicoId === undefined) {
      if (rol === UserRole.MECANICO) {
        throw new BadRequestException(
          'Un usuario con rol mecanico debe vincularse a un mecánico activo',
        );
      }
      return null;
    }
    return this.validarMecanicoActivo(mecanicoId);
  }

  private async validarMecanicoActivo(
    id: number,
    exceptUsuarioId?: number,
  ): Promise<Mecanico> {
    const mecanico = await this.mecanicoRepository.findOne({
      where: { id, activo: true },
    });
    if (!mecanico) {
      throw new NotFoundException(`Mecánico activo con ID ${id} no encontrado`);
    }
    const usuarioVinculado = await this.usuarioRepository.findOne({
      where: { mecanico: { id } },
    });
    if (usuarioVinculado && usuarioVinculado.id !== exceptUsuarioId) {
      throw new ConflictException(
        `El mecánico con ID ${id} ya está vinculado a otro usuario`,
      );
    }
    return mecanico;
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
}
