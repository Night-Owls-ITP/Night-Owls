import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrdenTrabajo } from './orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Mecanico } from '../mecanicos/mecanico.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { UserRole } from '../usuarios/user-role.enum';
import { AuthenticatedUser } from '../auth/authenticated-user';

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
    @InjectRepository(Usuario)
    private readonly usuarioRepository?: Repository<Usuario>,
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

  async obtenerTodas(usuario?: AuthenticatedUser): Promise<OrdenTrabajo[]> {
    if (usuario?.rol === UserRole.MECANICO) {
      const mecanicoId = await this.obtenerMecanicoVinculado(usuario);
      return this.ordenRepository.find({
        where: { mecanico: { id: mecanicoId } },
      });
    }
    return await this.ordenRepository.find();
  }

  async obtenerPorId(
    id: number,
    usuario?: AuthenticatedUser,
  ): Promise<OrdenTrabajo> {
    const where =
      usuario?.rol === UserRole.MECANICO
        ? {
            id,
            mecanico: { id: await this.obtenerMecanicoVinculado(usuario) },
          }
        : { id };
    const orden = await this.ordenRepository.findOne({
      where,
    });

    if (!orden) {
      if (usuario?.rol === UserRole.MECANICO) {
        throw new ForbiddenException('La orden no está asignada a este mecánico');
      }
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

  private async obtenerMecanicoVinculado(
    usuario: AuthenticatedUser,
  ): Promise<number> {
    if (!this.usuarioRepository) {
      throw new ForbiddenException('La cuenta no tiene un mecánico vinculado');
    }
    const cuenta = await this.usuarioRepository.findOne({
      where: { id: usuario.id },
      relations: { mecanico: true },
    });
    if (!cuenta?.mecanico?.activo) {
      throw new ForbiddenException('La cuenta no tiene un mecánico activo');
    }
    return cuenta.mecanico.id;
  }
}