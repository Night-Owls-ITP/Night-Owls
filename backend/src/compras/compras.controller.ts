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
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { ComprasService } from './compras.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('compras')
@Roles(UserRole.ADMINISTRADOR, UserRole.INVENTARISTA)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  crear(@Body() datos: CreateCompraDto) {
    return this.comprasService.crear(datos);
  }

  @Get()
  obtenerTodos() {
    return this.comprasService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateCompraDto,
  ) {
    return this.comprasService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.eliminar(id);
  }
}
