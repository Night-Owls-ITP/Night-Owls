import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateMecanicoDto } from './dto/create-mecanico.dto';
import { UpdateMecanicoDto } from './dto/update-mecanico.dto';
import { Mecanico } from './mecanico.entity';

@Injectable()
export class MecanicosService {
  constructor(
    @InjectRepository(Mecanico)
    private readonly mecanicoRepository: Repository<Mecanico>,
  ) {}

  async crear(datos: CreateMecanicoDto): Promise<Mecanico> {
    try {
      return await this.mecanicoRepository.save(
        this.mecanicoRepository.create(datos),
      );
    } catch (error) {
      this.throwIfDuplicateDocument(error);
      throw error;
    }
  }

  obtenerTodos(): Promise<Mecanico[]> {
    return this.mecanicoRepository.find();
  }

  async obtenerPorId(id: number): Promise<Mecanico> {
    this.validarId(id);
    const mecanico = await this.mecanicoRepository.findOne({ where: { id } });
    if (!mecanico) {
      throw new NotFoundException(`Mecánico con ID ${id} no encontrado`);
    }
    return mecanico;
  }

  async actualizar(id: number, datos: UpdateMecanicoDto): Promise<Mecanico> {
    const mecanico = await this.obtenerPorId(id);
    Object.assign(mecanico, datos);
    try {
      return await this.mecanicoRepository.save(mecanico);
    } catch (error) {
      this.throwIfDuplicateDocument(error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<{ message: string }> {
    const mecanico = await this.obtenerPorId(id);
    await this.mecanicoRepository.remove(mecanico);
    return { message: 'Mecánico eliminado correctamente' };
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Mecánico con ID ${id} no encontrado`);
    }
  }

  private throwIfDuplicateDocument(error: unknown): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException('Ya existe un mecánico con ese documento');
    }
  }
}
