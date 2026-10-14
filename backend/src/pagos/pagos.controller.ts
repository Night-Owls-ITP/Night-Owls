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
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { PagosService } from './pagos.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.CAJERO)
  crear(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.crear(createPagoDto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.CAJERO)
  obtenerTodos() {
    return this.pagosService.obtenerTodos();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.CAJERO)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.CAJERO)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto,
  ) {
    return this.pagosService.actualizar(id, updatePagoDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.CAJERO)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.eliminar(id);
  }
}
