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
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../usuarios/user-role.enum';

import { VehiculosService } from './vehiculos.service';

import { CreateVehiculoDto } from './dto/create-vehiculo.dto';

import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Controller('vehiculos')
@Roles(UserRole.ADMINISTRADOR)
export class VehiculosController {
  constructor(
    private readonly vehiculosService:
      VehiculosService,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
  crear(
    @Body()
    createVehiculoDto: CreateVehiculoDto,
  ) {
    return this.vehiculosService.crear(
      createVehiculoDto,
    );
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA, UserRole.CAJERO)
  obtenerTodos() {
    return this.vehiculosService.obtenerTodos();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA, UserRole.CAJERO)
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
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
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