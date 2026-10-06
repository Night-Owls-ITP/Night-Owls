import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { lanzarConflictoDeIntegridad } from '../common/database-errors';
import { DetalleCompra } from '../detalles-compra/detalle-compra.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { Compra } from './compra.entity';
import { Proveedor } from '../proveedores/proveedor.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async crear(datos: CreateCompraDto): Promise<Compra> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const proveedor = await manager.getRepository(Proveedor).findOne({
          where: { id: datos.proveedorId, activo: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!proveedor) {
          throw new NotFoundException(
            `Proveedor activo con ID ${datos.proveedorId} no encontrado`,
          );
        }
        const compra = manager.getRepository(Compra).create({
          proveedor,
          fecha: datos.fecha,
          total: '0.00',
        });
        return manager.getRepository(Compra).save(compra);
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  obtenerTodos(): Promise<Compra[]> {
    return this.compraRepository.find({ relations: { proveedor: true } });
  }

  async obtenerPorId(id: number): Promise<Compra> {
    this.validarId(id);
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: { proveedor: true },
    });
    if (!compra) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }
    return compra;
  }

  async actualizar(id: number, datos: UpdateCompraDto): Promise<Compra> {
    this.validarId(id);
    try {
      return await this.dataSource.transaction(async (manager) => {
        let proveedor: Proveedor | null | undefined;
        if (datos.proveedorId !== undefined) {
          proveedor = await manager.getRepository(Proveedor).findOne({
            where: { id: datos.proveedorId, activo: true },
            lock: { mode: 'pessimistic_write' },
          });
          if (!proveedor) {
            throw new NotFoundException(
              `Proveedor activo con ID ${datos.proveedorId} no encontrado`,
            );
          }
        }
        const compra = await manager.getRepository(Compra).findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!compra) {
          throw new NotFoundException(`Compra con ID ${id} no encontrada`);
        }
        if (datos.fecha !== undefined) {
          compra.fecha = datos.fecha;
        }
        if (proveedor) {
          compra.proveedor = proveedor;
        }
        return manager.getRepository(Compra).save(compra);
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  async eliminar(id: number): Promise<{ message: string }> {
    this.validarId(id);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const compra = await manager.getRepository(Compra).findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!compra) {
          throw new NotFoundException(`Compra con ID ${id} no encontrada`);
        }
        const detalles = await manager.getRepository(DetalleCompra).count({
          where: { compra: { id } },
        });
        if (detalles > 0) {
          throw new ConflictException(
            'Retire los detalles de compra antes de eliminar la compra',
          );
        }
        await manager.getRepository(Compra).remove(compra);
        return { message: 'Compra eliminada correctamente' };
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }
  }
}
