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
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { ServiciosService } from './servicios.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  crear(@Body() datos: CreateServicioDto) {
    return this.serviciosService.crear(datos);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  obtenerTodos() {
    return this.serviciosService.obtenerTodos();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.MECANICO)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateServicioDto,
  ) {
    return this.serviciosService.actualizar(id, datos);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.eliminar(id);
  }
}
