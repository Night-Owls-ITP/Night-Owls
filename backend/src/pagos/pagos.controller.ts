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
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  crear(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.crear(createPagoDto);
  }

  @Get()
  obtenerTodos() {
    return this.pagosService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto,
  ) {
    return this.pagosService.actualizar(id, updatePagoDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.eliminar(id);
  }
}
