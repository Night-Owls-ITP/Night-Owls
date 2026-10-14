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
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';
import { UserRole } from './user-role.enum';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  crear(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  obtenerTodos() {
    return this.usuariosService.obtenerTodos();
  }

  @Get('roles')
  @Roles(UserRole.ADMINISTRADOR)
  obtenerRoles() {
    return this.usuariosService.obtenerRoles();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR)
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.obtenerPorId(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.actualizar(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}
