import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { VehiculosService } from './vehiculos.service';

import { CreateVehiculoDto } from './dto/create-vehiculo.dto';

import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(
    private readonly vehiculosService:
      VehiculosService,
  ) {}

  @Post()
  crear(
    @Body()
    createVehiculoDto: CreateVehiculoDto,
  ) {
    return this.vehiculosService.crear(
      createVehiculoDto,
    );
  }

  @Get()
  obtenerTodos() {
    return this.vehiculosService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.vehiculosService.obtenerPorId(
      id,
    );
  }

  @Patch(':id')
  actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateVehiculoDto:
      UpdateVehiculoDto,
  ) {
    return this.vehiculosService.actualizar(
      id,
      updateVehiculoDto,
    );
  }

  @Delete(':id')
  eliminar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.vehiculosService.eliminar(
      id,
    );
  }
}