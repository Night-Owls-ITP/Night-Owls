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
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { FacturasService } from './facturas.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('facturas')
@Roles(UserRole.ADMINISTRADOR, UserRole.CAJERO)
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  crear(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.crear(createFacturaDto);
  }

  @Get()
  obtenerTodos() {
    return this.facturasService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacturaDto: UpdateFacturaDto,
  ) {
    return this.facturasService.actualizar(id, updateFacturaDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.eliminar(id);
  }
}
