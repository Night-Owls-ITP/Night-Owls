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
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { DetallesCompraService } from './detalles-compra.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('detalles-compra')
@Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
export class DetallesCompraController {
  constructor(private readonly detallesCompraService: DetallesCompraService) {}

  @Post()
  crear(@Body() datos: CreateDetalleCompraDto) {
    return this.detallesCompraService.crear(datos);
  }

  @Get()
  obtenerTodos() {
    return this.detallesCompraService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.detallesCompraService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateDetalleCompraDto,
  ) {
    return this.detallesCompraService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.detallesCompraService.eliminar(id);
  }
}
