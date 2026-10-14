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
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ProveedoresService } from './proveedores.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
  crear(@Body() datos: CreateProveedorDto) {
    return this.proveedoresService.crear(datos);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
  obtenerTodos() {
    return this.proveedoresService.obtenerTodos();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateProveedorDto,
  ) {
    return this.proveedoresService.actualizar(id, datos);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.eliminar(id);
  }
}
