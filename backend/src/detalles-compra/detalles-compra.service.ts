import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  centavosAPrecio,
  calcularSubtotal,
  precioACentavos,
} from '../common/money';
import { Compra } from '../compras/compra.entity';
import { lanzarConflictoDeIntegridad } from '../common/database-errors';
import { Repuesto } from '../repuestos/repuesto.entity';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { DetalleCompra } from './detalle-compra.entity';

const MAX_STOCK = 2_147_483_647;

@Injectable()
export class DetallesCompraService {
  constructor(
    @InjectRepository(DetalleCompra)
    private readonly detalleRepository: Repository<DetalleCompra>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async crear(datos: CreateDetalleCompraDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const compras = await this.bloquearCompras(manager, [datos.compraId]);
        const compra = compras.get(datos.compraId);
        if (!compra) {
          throw new NotFoundException(
            `Compra con ID ${datos.compraId} no encontrada`,
          );
        }
        const repuestos = await this.bloquearRepuestos(manager, [
          datos.repuestoId,
        ]);
        const repuesto = repuestos.get(datos.repuestoId);
        if (!repuesto || !repuesto.activo) {
          throw new NotFoundException(
            `Repuesto activo con ID ${datos.repuestoId} no encontrado`,
          );
        }
        const costoUnitario = datos.costoUnitario.toFixed(2);
        calcularSubtotal(costoUnitario, datos.cantidad);
        this.ajustarStock(repuesto, datos.cantidad);
        await manager.getRepository(Repuesto).save(repuesto);
        const detalle = manager.getRepository(DetalleCompra).create({
          compra,
          repuesto,
          cantidad: datos.cantidad,
          costoUnitario,
        });
        const guardado = await manager
          .getRepository(DetalleCompra)
          .save(detalle);
        await this.recalcularTotal(manager, compra);
        return this.conSubtotal(guardado);
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  async obtenerTodos() {
    const detalles = await this.detalleRepository.find({
      relations: { compra: true, repuesto: true },
    });
    return detalles.map((detalle) => this.conSubtotal(detalle));
  }

  async obtenerPorId(id: number) {
    this.validarId(id);
    const detalle = await this.detalleRepository.findOne({
      where: { id },
      relations: { compra: true, repuesto: true },
    });
    if (!detalle) {
      throw new NotFoundException(
        `Detalle de compra con ID ${id} no encontrado`,
      );
    }
    return this.conSubtotal(detalle);
  }

  async actualizar(id: number, datos: UpdateDetalleCompraDto) {
    this.validarId(id);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const detalle = await manager.getRepository(DetalleCompra).findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!detalle) {
          throw new NotFoundException(
            `Detalle de compra con ID ${id} no encontrado`,
          );
        }

        const compraAnteriorId = detalle.compraId;
        const repuestoAnteriorId = detalle.repuestoId;
        if (!compraAnteriorId || !repuestoAnteriorId) {
          throw new BadRequestException(
            'El detalle no tiene relaciones válidas',
          );
        }
        const compraNuevaId = datos.compraId ?? compraAnteriorId;
        const repuestoNuevoId = datos.repuestoId ?? repuestoAnteriorId;
        const cantidadNueva = datos.cantidad ?? detalle.cantidad;
        const compras = await this.bloquearCompras(manager, [
          compraAnteriorId,
          compraNuevaId,
        ]);
        const compraAnterior = compras.get(compraAnteriorId);
        const compraNueva = compras.get(compraNuevaId);
        if (!compraAnterior || !compraNueva) {
          throw new NotFoundException(
            'No se encontró una de las compras indicadas',
          );
        }
        const repuestos = await this.bloquearRepuestos(manager, [
          repuestoAnteriorId,
          repuestoNuevoId,
        ]);
        const repuestoAnterior = repuestos.get(repuestoAnteriorId);
        const repuestoNuevo = repuestos.get(repuestoNuevoId);
        if (!repuestoAnterior || !repuestoNuevo) {
          throw new NotFoundException(
            'No se encontró uno de los repuestos indicados',
          );
        }
        if (repuestoNuevoId !== repuestoAnteriorId && !repuestoNuevo.activo) {
          throw new NotFoundException(
            `Repuesto activo con ID ${repuestoNuevoId} no encontrado`,
          );
        }

        if (repuestoNuevoId === repuestoAnteriorId) {
          this.ajustarStock(repuestoAnterior, cantidadNueva - detalle.cantidad);
        } else {
          this.ajustarStock(repuestoAnterior, -detalle.cantidad);
          this.ajustarStock(repuestoNuevo, cantidadNueva);
        }
        const costoUnitario =
          datos.costoUnitario === undefined
            ? detalle.costoUnitario
            : datos.costoUnitario.toFixed(2);
        calcularSubtotal(costoUnitario, cantidadNueva);

        detalle.compra = compraNueva;
        detalle.repuesto = repuestoNuevo;
        detalle.cantidad = cantidadNueva;
        detalle.costoUnitario = costoUnitario;
        await manager
          .getRepository(Repuesto)
          .save([...new Set(repuestos.values())]);
        const actualizado = await manager
          .getRepository(DetalleCompra)
          .save(detalle);
        for (const compraId of new Set([compraAnteriorId, compraNuevaId])) {
          const compra = compras.get(compraId);
          if (compra) {
            await this.recalcularTotal(manager, compra);
          }
        }
        return this.conSubtotal(actualizado);
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  async eliminar(id: number): Promise<{ message: string }> {
    this.validarId(id);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const detalle = await manager.getRepository(DetalleCompra).findOne({
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!detalle) {
          throw new NotFoundException(
            `Detalle de compra con ID ${id} no encontrado`,
          );
        }
        const compraId = detalle.compraId;
        const repuestoId = detalle.repuestoId;
        if (!compraId || !repuestoId) {
          throw new BadRequestException(
            'El detalle no tiene relaciones válidas',
          );
        }
        const compras = await this.bloquearCompras(manager, [compraId]);
        const compra = compras.get(compraId);
        if (!compra) {
          throw new NotFoundException(
            `Compra con ID ${compraId} no encontrada`,
          );
        }
        const repuestos = await this.bloquearRepuestos(manager, [repuestoId]);
        const repuesto = repuestos.get(repuestoId);
        if (!repuesto) {
          throw new NotFoundException(
            `Repuesto con ID ${repuestoId} no encontrado`,
          );
        }
        this.ajustarStock(repuesto, -detalle.cantidad);
        await manager.getRepository(Repuesto).save(repuesto);
        await manager.getRepository(DetalleCompra).remove(detalle);
        await this.recalcularTotal(manager, compra);
        return { message: 'Detalle de compra eliminado correctamente' };
      });
    } catch (error) {
      lanzarConflictoDeIntegridad(error);
    }
  }

  private async bloquearCompras(
    manager: EntityManager,
    ids: number[],
  ): Promise<Map<number, Compra>> {
    const compras = new Map<number, Compra>();
    for (const id of [...new Set(ids)].sort((left, right) => left - right)) {
      const compra = await manager.getRepository(Compra).findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (compra) {
        compras.set(id, compra);
      }
    }
    return compras;
  }

  private async bloquearRepuestos(
    manager: EntityManager,
    ids: number[],
  ): Promise<Map<number, Repuesto>> {
    const repuestos = new Map<number, Repuesto>();
    for (const id of [...new Set(ids)].sort((left, right) => left - right)) {
      const repuesto = await manager.getRepository(Repuesto).findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (repuesto) {
        repuestos.set(id, repuesto);
      }
    }
    return repuestos;
  }

  private ajustarStock(repuesto: Repuesto, diferencia: number): void {
    const nuevoStock = repuesto.stock + diferencia;
    if (nuevoStock < 0) {
      throw new BadRequestException(
        `Stock insuficiente para el repuesto ${repuesto.id}`,
      );
    }
    if (!Number.isSafeInteger(nuevoStock) || nuevoStock > MAX_STOCK) {
      throw new BadRequestException(
        'El stock excede el límite de la columna INT',
      );
    }
    repuesto.stock = nuevoStock;
  }

  private async recalcularTotal(
    manager: EntityManager,
    compra: Compra,
  ): Promise<void> {
    const detalles = await manager.getRepository(DetalleCompra).find({
      where: { compra: { id: compra.id } },
    });
    let totalCentavos = 0n;
    for (const detalle of detalles) {
      totalCentavos +=
        precioACentavos(detalle.costoUnitario) * BigInt(detalle.cantidad);
    }
    compra.total = centavosAPrecio(totalCentavos);
    await manager.getRepository(Compra).save(compra);
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(
        `Detalle de compra con ID ${id} no encontrado`,
      );
    }
  }

  private conSubtotal(detalle: DetalleCompra) {
    return {
      ...detalle,
      compraId: detalle.compra?.id ?? detalle.compraId,
      repuestoId: detalle.repuesto?.id ?? detalle.repuestoId,
      subtotal: calcularSubtotal(detalle.costoUnitario, detalle.cantidad),
    };
  }
}
