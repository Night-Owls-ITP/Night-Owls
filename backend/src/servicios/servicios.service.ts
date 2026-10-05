import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleServicio } from '../detalles-servicio/detalle-servicio.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { Servicio } from './servicio.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(DetalleServicio)
    private readonly detalleRepository: Repository<DetalleServicio>,
  ) {}

  crear(datos: CreateServicioDto): Promise<Servicio> {
    return this.servicioRepository.save(
      this.servicioRepository.create({
        ...datos,
        precioBase: datos.precioBase.toFixed(2),
      }),
    );
  }

  obtenerTodos(): Promise<Servicio[]> {
    return this.servicioRepository.find();
  }

  async obtenerPorId(id: number): Promise<Servicio> {
    this.validarId(id);
    const servicio = await this.servicioRepository.findOne({ where: { id } });
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return servicio;
  }

  async actualizar(id: number, datos: UpdateServicioDto): Promise<Servicio> {
    const servicio = await this.obtenerPorId(id);
    Object.assign(servicio, datos);
    if (datos.precioBase !== undefined) {
      servicio.precioBase = datos.precioBase.toFixed(2);
    }
    return this.servicioRepository.save(servicio);
  }

  async eliminar(id: number): Promise<{ message: string }> {
    const servicio = await this.obtenerPorId(id);
    const detalles = await this.detalleRepository.count({
      where: { servicio: { id } },
    });
    if (detalles > 0) {
      throw new ConflictException(
        'No se puede eliminar un servicio utilizado por detalles existentes; desactívelo',
      );
    }
    await this.servicioRepository.remove(servicio);
    return { message: 'Servicio eliminado correctamente' };
  }

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
  }
}
