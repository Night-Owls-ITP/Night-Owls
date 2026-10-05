import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Cita } from './cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepository: Repository<OrdenTrabajo>,
  ) {}

  async crear(datos: CreateCitaDto): Promise<Cita> {
    const vehiculo = await this.obtenerVehiculo(datos.vehiculoId);
    const ordenTrabajo =
      datos.ordenTrabajoId === undefined || datos.ordenTrabajoId === null
        ? null
        : await this.obtenerOrdenDelVehiculo(
            datos.ordenTrabajoId,
            datos.vehiculoId,
          );
    return this.citaRepository.save(
      this.citaRepository.create({
        ...datos,
        fechaHora: new Date(datos.fechaHora),
        vehiculo,
        ordenTrabajo,
      }),
    );
  }

  obtenerTodas(): Promise<Cita[]> {
    return this.citaRepository.find();
  }

  async obtenerPorId(id: number): Promise<Cita> {
    this.validarId(id);
    const cita = await this.citaRepository.findOne({ where: { id } });
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return cita;
  }

  async actualizar(id: number, datos: UpdateCitaDto): Promise<Cita> {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: { vehiculo: true, ordenTrabajo: true },
    });
    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    this.validarId(id);

    const vehiculoId = datos.vehiculoId ?? cita.vehiculo.id;
    if (datos.vehiculoId !== undefined) {
      cita.vehiculo = await this.obtenerVehiculo(datos.vehiculoId);
    }

    const ordenTrabajoId =
      datos.ordenTrabajoId === undefined
        ? (cita.ordenTrabajo?.id ?? null)
        : datos.ordenTrabajoId;
    if (ordenTrabajoId !== null) {
      cita.ordenTrabajo = await this.obtenerOrdenDelVehiculo(
        ordenTrabajoId,
        vehiculoId,
      );
    } else {
      cita.ordenTrabajo = null;
    }

    if (datos.fechaHora !== undefined) {
      cita.fechaHora = new Date(datos.fechaHora);
    }
    if (datos.motivo !== undefined) {
      cita.motivo = datos.motivo;
    }
    if (datos.estado !== undefined) {
      cita.estado = datos.estado;
    }
    return this.citaRepository.save(cita);
  }

  async eliminar(id: number): Promise<{ message: string }> {
    const cita = await this.obtenerPorId(id);
    await this.citaRepository.remove(cita);
    return { message: 'Cita eliminada correctamente' };
  }

  private async obtenerVehiculo(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepository.findOne({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }
    return vehiculo;
  }

  private async obtenerOrdenDelVehiculo(
    id: number,
    vehiculoId: number,
  ): Promise<OrdenTrabajo> {
    const orden = await this.ordenRepository.findOne({
      where: { id },
      relations: { vehiculo: true },
    });
    if (!orden) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }
    if (orden.vehiculo.id !== vehiculoId) {
      throw new NotFoundException(
        `La orden de trabajo ${id} no pertenece al vehículo ${vehiculoId}`,
      );
    }
    return orden;
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
  }
}
