import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrdenTrabajo } from './orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Mecanico } from '../mecanicos/mecanico.entity';

import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';

import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepository: Repository<OrdenTrabajo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(Mecanico)
    private readonly mecanicoRepository: Repository<Mecanico>,
  ) {}

  async crear(
    createOrdenTrabajoDto: CreateOrdenTrabajoDto,
  ): Promise<OrdenTrabajo> {
    const { vehiculoId, mecanicoId, ...datosOrden } = createOrdenTrabajoDto;
    const vehiculo = await this.vehiculoRepository.findOne({
      where: { id: vehiculoId },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${vehiculoId} no encontrado`,
      );
    }

    const mecanico =
      mecanicoId === undefined || mecanicoId === null
        ? null
        : await this.obtenerMecanicoActivo(mecanicoId);

    const orden = this.ordenRepository.create({
      ...datosOrden,
      vehiculo,
      mecanico,
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

    const { vehiculoId, mecanicoId, ...datosOrden } = datos;

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

    if (mecanicoId !== undefined) {
      orden.mecanico =
        mecanicoId === null
          ? null
          : await this.obtenerMecanicoActivo(mecanicoId);
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

  private async obtenerMecanicoActivo(id: number): Promise<Mecanico> {
    const mecanico = await this.mecanicoRepository.findOne({
      where: { id, activo: true },
    });

    if (!mecanico) {
      throw new NotFoundException(
        `Mecánico activo con ID ${id} no encontrado`,
      );
    }

    return mecanico;
  }
}