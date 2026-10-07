import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from '../facturas/factura.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Servicio } from '../servicios/servicio.entity';
import { CreateDetalleServicioDto } from './dto/create-detalle-servicio.dto';
import { UpdateDetalleServicioDto } from './dto/update-detalle-servicio.dto';
import { DetalleServicio } from './detalle-servicio.entity';
import { calcularSubtotal } from './money';

@Injectable()
export class DetallesServicioService {
  constructor(
    @InjectRepository(DetalleServicio)
    private readonly detalleRepository: Repository<DetalleServicio>,
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepository: Repository<OrdenTrabajo>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Factura)
    private readonly facturaRepository?: Repository<Factura>,
  ) {}

  async crear(datos: CreateDetalleServicioDto) {
    const ordenTrabajo = await this.obtenerOrden(datos.ordenTrabajoId);
    await this.validarOrdenSinFactura(ordenTrabajo.id);
    const servicio = await this.obtenerServicioActivo(datos.servicioId);
    const precioUnitario = datos.precioUnitario ?? Number(servicio.precioBase);
    const detalle = await this.detalleRepository.save(
      this.detalleRepository.create({
        ordenTrabajo,
        servicio,
        cantidad: datos.cantidad,
        precioUnitario: precioUnitario.toFixed(2),
      }),
    );
    return this.conSubtotal(detalle);
  }

  async obtenerTodos() {
    const detalles = await this.detalleRepository.find();
    return detalles.map((detalle) => this.conSubtotal(detalle));
  }

  async obtenerPorId(id: number) {
    this.validarId(id);
    const detalle = await this.detalleRepository.findOne({ where: { id } });
    if (!detalle) {
      throw new NotFoundException(
        `Detalle de servicio con ID ${id} no encontrado`,
      );
    }
    return this.conSubtotal(detalle);
  }

  async actualizar(id: number, datos: UpdateDetalleServicioDto) {
    const detalle = await this.obtenerEntidad(id);
    let servicio = detalle.servicio;

    if (datos.ordenTrabajoId !== undefined) {
      const orden = await this.obtenerOrden(datos.ordenTrabajoId);
      await this.validarOrdenSinFactura(orden.id);
      detalle.ordenTrabajo = orden;
    } else {
      await this.validarOrdenSinFactura(detalle.ordenTrabajoId);
    }

    if (
      datos.servicioId !== undefined &&
      datos.servicioId !== detalle.servicioId
    ) {
      servicio = await this.obtenerServicioActivo(datos.servicioId);
      if (datos.precioUnitario === undefined) {
        throw new BadRequestException(
          'Al cambiar el servicio, envíe también precioUnitario para confirmar el precio aplicado',
        );
      }
      detalle.servicio = servicio;
    }

    if (datos.cantidad !== undefined) {
      detalle.cantidad = datos.cantidad;
    }
    if (datos.precioUnitario !== undefined) {
      detalle.precioUnitario = datos.precioUnitario.toFixed(2);
    }

    const actualizado = await this.detalleRepository.save(detalle);
    return this.conSubtotal(actualizado);
  }

  async eliminar(id: number): Promise<{ message: string }> {
    const detalle = await this.obtenerEntidad(id);
    await this.validarOrdenSinFactura(detalle.ordenTrabajoId);
    await this.detalleRepository.remove(detalle);
    return { message: 'Detalle de servicio eliminado correctamente' };
  }

  private async obtenerEntidad(id: number): Promise<DetalleServicio> {
    this.validarId(id);
    const detalle = await this.detalleRepository.findOne({
      where: { id },
      relations: { servicio: true },
    });
    if (!detalle) {
      throw new NotFoundException(
        `Detalle de servicio con ID ${id} no encontrado`,
      );
    }
    return detalle;
  }

  private async obtenerOrden(id: number): Promise<OrdenTrabajo> {
    const orden = await this.ordenRepository.findOne({ where: { id } });
    if (!orden) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }
    return orden;
  }

  private async obtenerServicioActivo(id: number): Promise<Servicio> {
    const servicio = await this.servicioRepository.findOne({
      where: { id, activo: true },
    });
    if (!servicio) {
      throw new NotFoundException(`Servicio activo con ID ${id} no encontrado`);
    }
    return servicio;
  }

  private async validarOrdenSinFactura(ordenTrabajoId: number): Promise<void> {
    if (!this.facturaRepository) {
      return;
    }
    const factura = await this.facturaRepository.findOne({
      where: { ordenTrabajo: { id: ordenTrabajoId } },
    });
    if (factura) {
      throw new ConflictException(
        'No se puede modificar un detalle de una orden facturada',
      );
    }
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(
        `Detalle de servicio con ID ${id} no encontrado`,
      );
    }
  }

  private conSubtotal(detalle: DetalleServicio) {
    return {
      ...detalle,
      subtotal: calcularSubtotal(detalle.precioUnitario, detalle.cantidad),
    };
  }
}
