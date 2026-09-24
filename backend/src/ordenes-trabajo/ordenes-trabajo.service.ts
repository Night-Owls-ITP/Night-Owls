import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrdenTrabajo } from './orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';

import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';

import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepository: Repository<OrdenTrabajo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
  ) {}

  async crear(
    createOrdenTrabajoDto: CreateOrdenTrabajoDto,
  ): Promise<OrdenTrabajo> {
    const { vehiculoId, ...datosOrden } = createOrdenTrabajoDto;
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id: vehiculoId },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${vehiculoId} no encontrado`,
      );
    }

    const orden = this.ordenRepository.create({
      ...datosOrden,
      vehiculo,
    });

    return await this.ordenRepository.save(orden);
  }

  async obtenerTodas(): Promise<OrdenTrabajo[]> {
    return await this.ordenRepository.find();
  }

  async obtenerPorId(id: number): Promise<OrdenTrabajo> {
    const orden = await this.ordenRepository.findOne({
      where: {
        id,
      },
    });

    if (!orden) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }

    return orden;
  }

  async actualizar(
    id: number,
    datos: UpdateOrdenTrabajoDto,
  ): Promise<OrdenTrabajo> {
    const orden = await this.obtenerPorId(id);

    const { vehiculoId, ...datosOrden } = datos;

    if (vehiculoId !== undefined) {
      const vehiculo = await this.vehiculoRepository.findOne({
        where: { id: vehiculoId },
      });

      if (!vehiculo) {
        throw new NotFoundException(
          `Vehículo con ID ${vehiculoId} no encontrado`,
        );
      }

      orden.vehiculo = vehiculo;
    }

    Object.assign(orden, datosOrden);

    return await this.ordenRepository.save(orden);
  }

  async eliminar(id: number) {
    const orden = await this.obtenerPorId(id);

    await this.ordenRepository.remove(orden);

    return {
      message: 'Orden de trabajo eliminada correctamente',
    };
  }
}