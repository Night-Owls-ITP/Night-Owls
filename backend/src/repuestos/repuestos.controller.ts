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
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { RepuestosService } from './repuestos.service';

@Controller('repuestos')
export class RepuestosController {
  constructor(private readonly repuestosService: RepuestosService) {}

  @Post()
  crear(@Body() datos: CreateRepuestoDto) {
    return this.repuestosService.crear(datos);
  }

  @Get()
  obtenerTodos() {
    return this.repuestosService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.repuestosService.obtenerPorId(id);
  }

  @Patch(':id')
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
