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
import { CreateDetalleRepuestoDto } from './dto/create-detalle-repuesto.dto';
import { UpdateDetalleRepuestoDto } from './dto/update-detalle-repuesto.dto';
import { DetallesRepuestoService } from './detalles-repuesto.service';

@Controller('detalles-repuesto')
export class DetallesRepuestoController {
  constructor(
    private readonly detallesRepuestoService: DetallesRepuestoService,
  ) {}

  @Post()
  crear(@Body() createDetalleRepuestoDto: CreateDetalleRepuestoDto) {
    return this.detallesRepuestoService.crear(createDetalleRepuestoDto);
  }

  @Get()
  obtenerTodos() {
    return this.detallesRepuestoService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.detallesRepuestoService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetalleRepuestoDto: UpdateDetalleRepuestoDto,
  ) {
    return this.detallesRepuestoService.actualizar(id, updateDetalleRepuestoDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.detallesRepuestoService.eliminar(id);
  }
}
