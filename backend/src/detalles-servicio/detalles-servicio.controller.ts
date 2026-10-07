import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-user';
import { Roles } from '../auth/roles.decorator';
import { CreateDetalleServicioDto } from './dto/create-detalle-servicio.dto';
import { UpdateDetalleServicioDto } from './dto/update-detalle-servicio.dto';
import { DetallesServicioService } from './detalles-servicio.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('detalles-servicio')
@Roles(UserRole.ADMINISTRADOR)
export class DetallesServicioController {
  constructor(
    private readonly detallesServicioService: DetallesServicioService,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  crear(
    @Body() datos: CreateDetalleServicioDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesServicioService.crear(datos, request.user);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.CAJERO)
  obtenerTodos(@Req() request: AuthenticatedRequest) {
    return this.detallesServicioService.obtenerTodos(request.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.CAJERO)
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesServicioService.obtenerPorId(id, request.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateDetalleServicioDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesServicioService.actualizar(id, datos, request.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesServicioService.eliminar(id, request.user);
  }
}
