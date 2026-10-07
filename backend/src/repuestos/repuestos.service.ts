import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { lanzarConflictoDeIntegridad } from '../common/database-errors';
import { DetalleCompra } from '../detalles-compra/detalle-compra.entity';
import { DetalleRepuesto } from '../detalles-repuesto/detalle-repuesto.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { Repuesto } from './repuesto.entity';

@Injectable()
export class RepuestosService {
  constructor(
    @InjectRepository(Repuesto)
    private readonly repuestoRepository: Repository<Repuesto>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepuestoRepository?: Repository<DetalleRepuesto>,
  ) {}

  async crear(datos: CreateRepuestoDto): Promise<Repuesto> {
    try {
      return await this.repuestoRepository.save(
        this.repuestoRepository.create({
          ...datos,
          stock: 0,
          precioVenta: datos.precioVenta.toFixed(2),
          activo: true,
        }),
      );
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  obtenerTodos(): Promise<Repuesto[]> {
    return this.repuestoRepository.find();
  }

  async obtenerPorId(id: number): Promise<Repuesto> {
    this.validarId(id);
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
    return repuesto;
  }

  async actualizar(id: number, datos: UpdateRepuestoDto): Promise<Repuesto> {
    await this.obtenerPorId(id);
    const cambios: Partial<Repuesto> = {};
    if (datos.codigo !== undefined) cambios.codigo = datos.codigo;
    if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
    if (datos.descripcion !== undefined)
      cambios.descripcion = datos.descripcion;
    if (datos.precioVenta !== undefined) {
      cambios.precioVenta = datos.precioVenta.toFixed(2);
    }
    if (datos.activo !== undefined) cambios.activo = datos.activo;
    try {
      const resultado = await this.repuestoRepository.update(id, cambios);
      if (!resultado.affected) {
        throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
      }
      return this.obtenerPorId(id);
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  async eliminar(id: number): Promise<{ message: string }> {
    this.validarId(id);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repuesto = await manager.getRepository(Repuesto).findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!repuesto) {
          throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
        }
        const detallesCompra = await manager.getRepository(DetalleCompra).count({
          where: { repuesto: { id } },
        });
        const detallesRepuesto = this.detalleRepuestoRepository
          ? await manager.getRepository(DetalleRepuesto).count({
              where: { repuesto: { id } },
            })
          : 0;
        if (detallesCompra > 0 || detallesRepuesto > 0) {
          throw new ConflictException(
            'No se puede eliminar un repuesto con detalles asociados; desactívelo primero',
          );
        }
        await manager.getRepository(Repuesto).remove(repuesto);
        return { message: 'Repuesto eliminado correctamente' };
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Repuesto con ID ${id} no encontrado`);
    }
  }
}
