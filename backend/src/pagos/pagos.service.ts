import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Factura } from '../facturas/factura.entity';
import { precioACentavos, centavosAPrecio } from '../common/money';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './pago.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async crear(datos: CreatePagoDto) {
    return this.dataSource.transaction(async (manager) => {
      const factura = await manager.getRepository(Factura).findOne({
        where: { id: datos.facturaId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!factura) {
        throw new NotFoundException(
          `Factura con ID ${datos.facturaId} no encontrada`,
        );
      }
      const pagos = await manager.getRepository(Pago).find({
        where: { factura: { id: factura.id } },
      });
      const totalPagado = pagos.reduce(
        (acc, pago) => acc + precioACentavos(pago.valor),
        0n,
      );
      const saldo = precioACentavos(factura.total) - totalPagado;
      if (precioACentavos(datos.valor) > saldo) {
        throw new BadRequestException('El pago excede el saldo pendiente');
      }
      const pago = manager.getRepository(Pago).create({
        factura,
        valor: datos.valor.toFixed(2),
        fecha: datos.fecha,
        metodo: datos.metodo,
        referencia: datos.referencia ?? null,
      });
      const creado = await manager.getRepository(Pago).save(pago);
      return this.conSaldo(creado, factura.total);
    });
  }

  async obtenerTodos() {
    const pagos = await this.pagoRepository.find({ relations: { factura: true } });
    return pagos.map((pago) => this.conSaldo(pago, pago.factura.total));
  }

  async obtenerPorId(id: number) {
    this.validarId(id);
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: { factura: true },
    });
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return this.conSaldo(pago, pago.factura.total);
  }

  async actualizar(id: number, datos: UpdatePagoDto) {
    return this.dataSource.transaction(async (manager) => {
      const pagoActual = await manager.getRepository(Pago).findOne({
        where: { id },
        relations: { factura: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!pagoActual) {
        throw new NotFoundException(`Pago con ID ${id} no encontrado`);
      }

      const factura = await manager.getRepository(Factura).findOne({
        where: { id: pagoActual.facturaId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!factura) {
        throw new NotFoundException(
          `Factura con ID ${pagoActual.facturaId} no encontrada`,
        );
      }

      const pagos = await manager.getRepository(Pago).find({
        where: { factura: { id: factura.id } },
      });
      const totalPagadoBase = pagos.reduce(
        (acc, pago) =>
          acc + (pago.id === id ? 0n : precioACentavos(pago.valor)),
        0n,
      );
      const nuevoValor = datos.valor ?? Number(pagoActual.valor);
      const nuevoPago = { ...pagoActual, ...datos, valor: new Number(nuevoValor).toFixed(2) };
      const saldo = precioACentavos(factura.total) - totalPagadoBase;
      if (precioACentavos(nuevoPago.valor) > saldo) {
        throw new BadRequestException('El pago actualizado excede el saldo disponible');
      }

      if (datos.facturaId !== undefined) {
        throw new ConflictException('No se permite mover un pago a otra factura');
      }

      Object.assign(pagoActual, datos);
      if (datos.valor !== undefined) {
        pagoActual.valor = datos.valor.toFixed(2);
      }
      if (datos.metodo !== undefined) {
        pagoActual.metodo = datos.metodo;
      }
      if (datos.fecha !== undefined) {
        pagoActual.fecha = datos.fecha;
      }
      if (datos.referencia !== undefined) {
        pagoActual.referencia = datos.referencia ?? null;
      }

      const actualizado = await manager.getRepository(Pago).save(pagoActual);
      return this.conSaldo(actualizado, factura.total);
    });
  }

  async eliminar(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const pago = await manager.getRepository(Pago).findOne({
        where: { id },
        relations: { factura: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!pago) {
        throw new NotFoundException(`Pago con ID ${id} no encontrado`);
      }
      await manager.getRepository(Pago).remove(pago);
      return { message: 'Pago eliminado correctamente' };
    });
  }

  private conSaldo(pago: Pago, totalFactura: string) {
    const totalFacturaCentavos = precioACentavos(totalFactura);
    const totalPagado = precioACentavos(pago.valor);
    return {
      ...pago,
      totalPagado: centavosAPrecio(totalPagado),
      saldoPendiente: centavosAPrecio(totalFacturaCentavos - totalPagado),
    };
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
  }
}
