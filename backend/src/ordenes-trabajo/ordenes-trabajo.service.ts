import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrdenTrabajo } from './orden-trabajo.entity';

import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';

import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepository: Repository<OrdenTrabajo>,
  ) {}

  async crear(
    createOrdenTrabajoDto: CreateOrdenTrabajoDto,
  ): Promise<OrdenTrabajo> {
    const orden = this.ordenRepository.create(
      createOrdenTrabajoDto,
    );

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

    Object.assign(orden, datos);

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