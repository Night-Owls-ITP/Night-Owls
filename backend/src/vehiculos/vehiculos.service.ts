import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { Vehiculo } from './vehiculo.entity';

@Injectable()
export class VehiculosService {
  private vehiculos: Vehiculo[] = [];
  private siguienteId = 1;

  crear(createVehiculoDto: CreateVehiculoDto): Vehiculo {
    const vehiculo: Vehiculo = {
      id: this.siguienteId++,
      ...createVehiculoDto,
    };

    this.vehiculos.push(vehiculo);

    return vehiculo;
  }

  obtenerTodos(): Vehiculo[] {
    return this.vehiculos;
  }

  obtenerPorId(id: number): Vehiculo {
    const vehiculo = this.vehiculos.find(
      (vehiculo) => vehiculo.id === id,
    );

    if (!vehiculo) {
      throw new NotFoundException(
        `No se encontró el vehículo con ID ${id}`,
      );
    }

    return vehiculo;
  }

  actualizar(
    id: number,
    datos: UpdateVehiculoDto,
  ): Vehiculo {
    const vehiculo = this.obtenerPorId(id);

    Object.assign(vehiculo, datos);

    return vehiculo;
  }

  eliminar(id: number): void {
    const indice = this.vehiculos.findIndex(
      (vehiculo) => vehiculo.id === id,
    );

    if (indice === -1) {
      throw new NotFoundException(
        `No se encontró el vehículo con ID ${id}`,
      );
    }

    this.vehiculos.splice(indice, 1);
  }
}