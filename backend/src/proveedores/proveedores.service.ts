import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { lanzarConflictoDeIntegridad } from '../common/database-errors';
import { Compra } from '../compras/compra.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from './proveedor.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async crear(datos: CreateProveedorDto): Promise<Proveedor> {
    try {
      return await this.proveedorRepository.save(
        this.proveedorRepository.create({ ...datos, activo: true }),
      );
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  obtenerTodos(): Promise<Proveedor[]> {
    return this.proveedorRepository.find();
  }

  async obtenerPorId(id: number): Promise<Proveedor> {
    this.validarId(id);
    const proveedor = await this.proveedorRepository.findOne({ where: { id } });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return proveedor;
  }

  async actualizar(id: number, datos: UpdateProveedorDto): Promise<Proveedor> {
    const proveedor = await this.obtenerPorId(id);
    Object.assign(proveedor, datos);
    try {
      return await this.proveedorRepository.save(proveedor);
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  async eliminar(id: number): Promise<{ message: string }> {
    this.validarId(id);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const proveedor = await manager.getRepository(Proveedor).findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!proveedor) {
          throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
        }
        const compras = await manager.getRepository(Compra).count({
          where: { proveedor: { id } },
        });
        if (compras > 0) {
          throw new ConflictException(
            'No se puede eliminar un proveedor con compras asociadas; desactívelo',
          );
        }
        await manager.getRepository(Proveedor).remove(proveedor);
        return { message: 'Proveedor eliminado correctamente' };
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
  }
}
