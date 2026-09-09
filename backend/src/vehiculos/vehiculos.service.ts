import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Vehiculo } from './vehiculo.entity';

import { CreateVehiculoDto } from './dto/create-vehiculo.dto';

import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository:
      Repository<Vehiculo>,
  ) {}

  async crear(
    createVehiculoDto: CreateVehiculoDto,
  ): Promise<Vehiculo> {
    const vehiculo =
      this.vehiculoRepository.create(
        createVehiculoDto,
      );

    return await this.vehiculoRepository.save(
      vehiculo,
    );
  }

  async obtenerTodos(): Promise<Vehiculo[]> {
    return await this.vehiculoRepository.find();
  }

  async obtenerPorId(
    id: number,
  ): Promise<Vehiculo> {
    const vehiculo =
      await this.vehiculoRepository.findOne({
        where: {
          id,
        },
      });

    if (!vehiculo) {
      throw new NotFoundException(
        `No se encontró el vehículo con ID ${id}`,
      );
    }

    return vehiculo;
  }

  async actualizar(
    id: number,
    datos: UpdateVehiculoDto,
  ): Promise<Vehiculo> {
    const vehiculo =
      await this.obtenerPorId(id);

    Object.assign(
      vehiculo,
      datos,
    );

    return await this.vehiculoRepository.save(
      vehiculo,
    );
  }

  async eliminar(
    id: number,
  ) {
    const vehiculo =
      await this.obtenerPorId(id);

    await this.vehiculoRepository.remove(
      vehiculo,
    );

    return {
      message:
        'Vehículo eliminado correctamente',
    };
  }
}