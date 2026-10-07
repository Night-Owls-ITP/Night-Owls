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
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { RepuestosService } from './repuestos.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('repuestos')
@Roles(UserRole.ADMINISTRADOR)
export class RepuestosController {
  constructor(private readonly repuestosService: RepuestosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
  crear(@Body() datos: CreateRepuestoDto) {
    return this.repuestosService.crear(datos);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.INVENTARISTA)
  obtenerTodos() {
    return this.repuestosService.obtenerTodos();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.INVENTARISTA)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.repuestosService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateRepuestoDto,
  ) {
    return this.repuestosService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.repuestosService.eliminar(id);
  }
}
