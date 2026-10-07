import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DetalleRepuesto } from '../detalles-repuesto/detalle-repuesto.entity';
import { DetalleServicio } from '../detalles-servicio/detalle-servicio.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Pago } from '../pagos/pago.entity';
import { precioACentavos, centavosAPrecio } from '../common/money';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Factura } from './factura.entity';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepository: Repository<OrdenTrabajo>,
    @InjectRepository(DetalleServicio)
    private readonly detalleServicioRepository: Repository<DetalleServicio>,
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepuestoRepository: Repository<DetalleRepuesto>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async crear(datos: CreateFacturaDto): Promise<Factura> {
    return this.dataSource.transaction(async (manager) => {
      const orden = await manager.getRepository(OrdenTrabajo).findOne({
        where: { id: Number(datos.ordenTrabajoId) },
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
          'La orden ya tiene una factura emitida',
        );
      }

      const total = await this.calcularTotal(manager, orden.id);
      const factura = manager.getRepository(Factura).create({
        numero: datos.numero,
        fecha: datos.fecha,
        ordenTrabajo: orden,
        total: total,
      });
      return manager.getRepository(Factura).save(factura);
    });
  }

  async obtenerTodos(): Promise<Factura[]> {
    return this.facturaRepository.find({ relations: { ordenTrabajo: true } });
  }

  async obtenerPorId(id: number): Promise<Factura> {
    this.validarId(id);
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: { ordenTrabajo: true },
    });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return factura;
  }

  async actualizar(id: number, datos: UpdateFacturaDto): Promise<Factura> {
    const factura = await this.obtenerPorId(id);
    if (datos.ordenTrabajoId !== undefined) {
      throw new BadRequestException('No se puede cambiar la orden asociada a la factura');
    }

    const cambios: Partial<Factura> = {};

    if (datos.numero !== undefined) {
      cambios.numero = datos.numero;
    }
    if (datos.fecha !== undefined) {
      cambios.fecha = datos.fecha;
    }
    if (Object.keys(cambios).length === 0) {
      return factura;
    }

    if (datos.numero !== undefined && datos.numero !== factura.numero) {
      const duplicada = await this.facturaRepository.findOne({
        where: { numero: datos.numero },
      });
      if (duplicada && duplicada.id !== id) {
        throw new ConflictException('El número de factura ya existe');
      }
    }

    await this.facturaRepository.update(id, cambios);
    return this.obtenerPorId(id);
  }

  async eliminar(id: number): Promise<{ message: string }> {
    this.validarId(id);
    return this.dataSource.transaction(async (manager) => {
      const factura = await manager.getRepository(Factura).findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!factura) {
        throw new NotFoundException(`Factura con ID ${id} no encontrada`);
      }
      const pagos = await manager.getRepository(Pago).count({
        where: { factura: { id: factura.id } },
      });
      if (pagos > 0) {
        throw new ConflictException(
          'No se puede eliminar una factura con pagos asociados',
        );
      }
      await manager.getRepository(Factura).remove(factura);
      return { message: 'Factura eliminada correctamente' };
    });
  }

  private async calcularTotal(
    manager: DataSource | any,
    ordenTrabajoId: number,
  ): Promise<string> {
    const servicios = await manager.getRepository(DetalleServicio).find({
      where: { ordenTrabajo: { id: ordenTrabajoId } },
    });
    const repuestos = await manager.getRepository(DetalleRepuesto).find({
      where: { ordenTrabajo: { id: ordenTrabajoId } },
    });

    let totalCentavos = 0n;

    for (const detalle of servicios) {
      totalCentavos += precioACentavos(detalle.precioUnitario) * BigInt(detalle.cantidad);
    }

    for (const detalle of repuestos) {
      totalCentavos += precioACentavos(detalle.precioUnitario) * BigInt(detalle.cantidad);
    }

    return centavosAPrecio(totalCentavos);
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
  }
}
