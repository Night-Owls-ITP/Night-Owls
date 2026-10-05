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
import { CreateDetalleServicioDto } from './dto/create-detalle-servicio.dto';
import { UpdateDetalleServicioDto } from './dto/update-detalle-servicio.dto';
import { DetallesServicioService } from './detalles-servicio.service';

@Controller('detalles-servicio')
export class DetallesServicioController {
  constructor(
    private readonly detallesServicioService: DetallesServicioService,
  ) {}

  @Post()
  crear(@Body() datos: CreateDetalleServicioDto) {
    return this.detallesServicioService.crear(datos);
  }

  @Get()
  obtenerTodos() {
    return this.detallesServicioService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.detallesServicioService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateDetalleServicioDto,
  ) {
    return this.detallesServicioService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.detallesServicioService.eliminar(id);
  }
}
