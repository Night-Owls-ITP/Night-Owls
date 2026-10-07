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

import { ClientesService } from './clientes.service';

import { CreateClienteDto } from './dto/create-cliente.dto';

import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
@Roles(UserRole.ADMINISTRADOR)
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
  crear(
    @Body()
    createClienteDto: CreateClienteDto,
  ) {
    return this.clientesService.crear(
      createClienteDto,
    );
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA, UserRole.CAJERO)
  obtenerTodos() {
    return this.clientesService.obtenerTodos();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA, UserRole.CAJERO)
  obtenerPorId(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.obtenerPorId(
      id,
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
  actualizar(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.actualizar(
      id,
      updateClienteDto,
    );
  }

  @Delete(':id')
  eliminar(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.eliminar(
      id,
    );
  }
}