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
import { UserRole } from '../usuarios/user-role.enum';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { CitasService } from './citas.service';

@Controller('citas')
@Roles(UserRole.ADMINISTRADOR)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
  crear(@Body() datos: CreateCitaDto) {
    return this.citasService.crear(datos);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
  obtenerTodas() {
    return this.citasService.obtenerTodas();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateCitaDto,
  ) {
    return this.citasService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.eliminar(id);
  }
}
