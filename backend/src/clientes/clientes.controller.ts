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

import { ClientesService } from './clientes.service';

import { CreateClienteDto } from './dto/create-cliente.dto';

import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  @Post()
  crear(
    @Body()
    createClienteDto: CreateClienteDto,
  ) {
    return this.clientesService.crear(
      createClienteDto,
    );
  }

  @Get()
  obtenerTodos() {
    return this.clientesService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.clientesService.obtenerPorId(
      id,
    );
  }

  @Patch(':id')
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