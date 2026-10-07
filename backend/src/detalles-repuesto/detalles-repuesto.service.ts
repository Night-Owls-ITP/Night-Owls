import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Factura } from '../facturas/factura.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Repuesto } from '../repuestos/repuesto.entity';
import { calcularSubtotal } from '../common/money';
import { CreateDetalleRepuestoDto } from './dto/create-detalle-repuesto.dto';
import { UpdateDetalleRepuestoDto } from './dto/update-detalle-repuesto.dto';
import { DetalleRepuesto } from './detalle-repuesto.entity';

@Injectable()
export class DetallesRepuestoService {
  constructor(
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepository: Repository<DetalleRepuesto>,
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepository: Repository<OrdenTrabajo>,
    @InjectRepository(Repuesto)
    private readonly repuestoRepository: Repository<Repuesto>,
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async crear(datos: CreateDetalleRepuestoDto) {
    return this.dataSource.transaction(async (manager) => {
      const orden = await manager.getRepository(OrdenTrabajo).findOne({
        where: { id: datos.ordenTrabajoId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!orden) {
        throw new NotFoundException(
          `Orden de trabajo con ID ${datos.ordenTrabajoId} no encontrada`,
        );
      }
      const facturaExistente = await manager.getRepository(Factura).findOne({
        where: { ordenTrabajo: { id: orden.id } },
        lock: { mode: 'pessimistic_write' },
      });
      if (facturaExistente) {
        throw new ConflictException(
          'No se pueden crear detalles para una orden ya facturada',
        );
      }

      const repuesto = await manager.getRepository(Repuesto).findOne({
        where: { id: datos.repuestoId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!repuesto || !repuesto.activo) {
        throw new NotFoundException(
          `Repuesto activo con ID ${datos.repuestoId} no encontrado`,
        );
      }
      if (datos.cantidad <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor que cero');
      }
      if (repuesto.stock < datos.cantidad) {
        throw new BadRequestException('Stock insuficiente para este consumo');
      }

      const precioUnitario =
        datos.precioUnitario ?? Number(repuesto.precioVenta ?? 0);
      const detalle = manager.getRepository(DetalleRepuesto).create({
        ordenTrabajo: orden,
        repuesto,
        cantidad: datos.cantidad,
        precioUnitario: precioUnitario.toFixed(2),
      });
      const creado = await manager.getRepository(DetalleRepuesto).save(detalle);
      repuesto.stock -= datos.cantidad;
      await manager.getRepository(Repuesto).save(repuesto);
      return this.conSubtotal(creado);
    });
  }

  async obtenerTodos() {
    const detalles = await this.detalleRepository.find({
      relations: { ordenTrabajo: true, repuesto: true },
    });
    return detalles.map((detalle) => this.conSubtotal(detalle));
  }

  async obtenerPorId(id: number) {
    this.validarId(id);
    const detalle = await this.detalleRepository.findOne({
      where: { id },
      relations: { ordenTrabajo: true, repuesto: true },
    });
    if (!detalle) {
      throw new NotFoundException(
        `Detalle de repuesto con ID ${id} no encontrado`,
      );
    }
    return this.conSubtotal(detalle);
  }

  async actualizar(id: number, datos: UpdateDetalleRepuestoDto) {
    return this.dataSource.transaction(async (manager) => {
      const detalle = await manager.getRepository(DetalleRepuesto).findOne({
        where: { id },
        relations: { ordenTrabajo: true, repuesto: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!detalle) {
        throw new NotFoundException(
          `Detalle de repuesto con ID ${id} no encontrado`,
        );
      }
      if (datos.ordenTrabajoId !== undefined) {
        const nuevaOrden = await manager.getRepository(OrdenTrabajo).findOne({
          where: { id: datos.ordenTrabajoId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!nuevaOrden) {
          throw new NotFoundException(
            `Orden de trabajo con ID ${datos.ordenTrabajoId} no encontrada`,
          );
        }
        const facturaNueva = await manager.getRepository(Factura).findOne({
          where: { ordenTrabajo: { id: nuevaOrden.id } },
          lock: { mode: 'pessimistic_write' },
        });
        if (facturaNueva) {
          throw new ConflictException(
            'No se puede mover un detalle a una orden ya facturada',
          );
        }
        detalle.ordenTrabajo = nuevaOrden;
      }

      if (datos.repuestoId !== undefined && datos.repuestoId !== detalle.repuestoId) {
        const nuevoRepuesto = await manager.getRepository(Repuesto).findOne({
          where: { id: datos.repuestoId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!nuevoRepuesto || !nuevoRepuesto.activo) {
          throw new NotFoundException(
            `Repuesto activo con ID ${datos.repuestoId} no encontrado`,
          );
        }

        detalle.repuesto.stock += detalle.cantidad;
        await manager.getRepository(Repuesto).save(detalle.repuesto);

        const cantidadFinal = datos.cantidad ?? detalle.cantidad;
        if (nuevoRepuesto.stock < cantidadFinal) {
          throw new BadRequestException('Stock insuficiente para el nuevo repuesto');
        }
        nuevoRepuesto.stock -= cantidadFinal;
        detalle.repuesto = nuevoRepuesto;
        await manager.getRepository(Repuesto).save(nuevoRepuesto);
      }

      if (datos.cantidad !== undefined) {
        const nuevaCantidad = datos.cantidad;
        if (nuevaCantidad <= 0) {
          throw new BadRequestException('La cantidad debe ser mayor que cero');
        }
        const diferencia = nuevaCantidad - detalle.cantidad;
        if (diferencia > 0) {
          if (detalle.repuesto.stock < diferencia) {
            throw new BadRequestException('Stock insuficiente para ajustar la cantidad');
          }
          detalle.repuesto.stock -= diferencia;
        } else if (diferencia < 0) {
          detalle.repuesto.stock += Math.abs(diferencia);
        }
        detalle.cantidad = nuevaCantidad;
      }

      if (datos.precioUnitario !== undefined) {
        detalle.precioUnitario = datos.precioUnitario.toFixed(2);
      }

      await manager.getRepository(DetalleRepuesto).save(detalle);
      await manager.getRepository(Repuesto).save(detalle.repuesto);
      const actualizado = await manager.getRepository(DetalleRepuesto).findOne({
        where: { id },
        relations: { ordenTrabajo: true, repuesto: true },
      });
      if (!actualizado) {
        throw new NotFoundException(
          `Detalle de repuesto con ID ${id} no encontrado`,
        );
      }
      return this.conSubtotal(actualizado);
    });
  }

  async eliminar(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const detalle = await manager.getRepository(DetalleRepuesto).findOne({
        where: { id },
        relations: { ordenTrabajo: true, repuesto: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!detalle) {
        throw new NotFoundException(
          `Detalle de repuesto con ID ${id} no encontrado`,
        );
      }
      const factura = await manager.getRepository(Factura).findOne({
        where: { ordenTrabajo: { id: detalle.ordenTrabajoId } },
        lock: { mode: 'pessimistic_write' },
      });
      if (factura) {
        throw new ConflictException(
          'No se puede eliminar un detalle de una orden facturada',
        );
      }
      detalle.repuesto.stock += detalle.cantidad;
      await manager.getRepository(Repuesto).save(detalle.repuesto);
      await manager.getRepository(DetalleRepuesto).remove(detalle);
      return { message: 'Detalle de repuesto eliminado correctamente' };
    });
  }

  private conSubtotal(detalle: DetalleRepuesto) {
    return {
      ...detalle,
      subtotal: calcularSubtotal(detalle.precioUnitario, detalle.cantidad),
    };
  }

  private validarId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(
        `Detalle de repuesto con ID ${id} no encontrado`,
      );
    }
  }
}
