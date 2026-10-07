import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
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

    const passwordHash = await bcrypt.hash(datos.password, 10);
    const usuario = this.usuarioRepository.create({
      nombre: datos.nombre,
      email,
      passwordHash,
      rol: datos.rol,
      activo: datos.activo ?? true,
    });
    const creado = await this.usuarioRepository.save(usuario);
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

  async actualizar(id: number, datos: UpdateUsuarioDto): Promise<Omit<Usuario, 'passwordHash'>> {
    this.validarId(id);
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
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

    if (datos.password !== undefined) {
      if (datos.password.length < 8) {
        throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
      }
      usuario.passwordHash = await bcrypt.hash(datos.password, 10);
    }

    const actualizado = await this.usuarioRepository.save(usuario);
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

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
}
