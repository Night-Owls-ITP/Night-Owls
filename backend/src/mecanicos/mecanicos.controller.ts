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
import { CreateMecanicoDto } from './dto/create-mecanico.dto';
import { UpdateMecanicoDto } from './dto/update-mecanico.dto';
import { MecanicosService } from './mecanicos.service';
import { UserRole } from '../usuarios/user-role.enum';

@Controller('mecanicos')
export class MecanicosController {
  constructor(private readonly mecanicosService: MecanicosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  crear(@Body() datos: CreateMecanicoDto) {
    return this.mecanicosService.crear(datos);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  obtenerTodos() {
    return this.mecanicosService.obtenerTodos();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.mecanicosService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateMecanicoDto,
  ) {
    return this.mecanicosService.actualizar(id, datos);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.mecanicosService.eliminar(id);
  }
}
