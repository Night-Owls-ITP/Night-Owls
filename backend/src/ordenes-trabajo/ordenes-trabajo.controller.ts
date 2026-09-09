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

import { OrdenesTrabajoService } from './ordenes-trabajo.service';

import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';

import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(
    private readonly ordenesTrabajoService:
      OrdenesTrabajoService,
  ) {}

  @Post()
  crear(
    @Body()
    createOrdenTrabajoDto:
      CreateOrdenTrabajoDto,
  ) {
    return this.ordenesTrabajoService.crear(
      createOrdenTrabajoDto,
    );
  }

  @Get()
  obtenerTodas() {
    return this.ordenesTrabajoService
      .obtenerTodas();
  }

  @Get(':id')
  obtenerPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.ordenesTrabajoService
      .obtenerPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateOrdenTrabajoDto:
      UpdateOrdenTrabajoDto,
  ) {
    return this.ordenesTrabajoService
      .actualizar(
        id,
        updateOrdenTrabajoDto,
      );
  }

  @Delete(':id')
  eliminar(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.ordenesTrabajoService
      .eliminar(id);
  }
}