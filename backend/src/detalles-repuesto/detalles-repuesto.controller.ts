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
import { CreateDetalleRepuestoDto } from './dto/create-detalle-repuesto.dto';
import { UpdateDetalleRepuestoDto } from './dto/update-detalle-repuesto.dto';
import { DetallesRepuestoService } from './detalles-repuesto.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('detalles-repuesto')
@Roles(UserRole.ADMINISTRADOR)
export class DetallesRepuestoController {
  constructor(
    private readonly detallesRepuestoService: DetallesRepuestoService,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  crear(
    @Body() createDetalleRepuestoDto: CreateDetalleRepuestoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesRepuestoService.crear(
      createDetalleRepuestoDto,
      request.user,
    );
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.CAJERO)
  obtenerTodos(@Req() request: AuthenticatedRequest) {
    return this.detallesRepuestoService.obtenerTodos(request.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.CAJERO)
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesRepuestoService.obtenerPorId(id, request.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetalleRepuestoDto: UpdateDetalleRepuestoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesRepuestoService.actualizar(
      id,
      updateDetalleRepuestoDto,
      request.user,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.detallesRepuestoService.eliminar(id, request.user);
  }
}
