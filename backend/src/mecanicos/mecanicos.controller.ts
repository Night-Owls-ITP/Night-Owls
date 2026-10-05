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
import { CreateMecanicoDto } from './dto/create-mecanico.dto';
import { UpdateMecanicoDto } from './dto/update-mecanico.dto';
import { MecanicosService } from './mecanicos.service';

@Controller('mecanicos')
export class MecanicosController {
  constructor(private readonly mecanicosService: MecanicosService) {}

  @Post()
  crear(@Body() datos: CreateMecanicoDto) {
    return this.mecanicosService.crear(datos);
  }

  @Get()
  obtenerTodos() {
    return this.mecanicosService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.mecanicosService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateMecanicoDto,
  ) {
    return this.mecanicosService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.mecanicosService.eliminar(id);
  }
}
