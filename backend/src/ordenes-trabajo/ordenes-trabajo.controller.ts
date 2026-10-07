import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/authenticated-user';
import { Roles } from '../auth/roles.decorator';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { UserRole } from '../usuarios/user-role.enum';

import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';

import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Controller('ordenes-trabajo')
@Roles(UserRole.ADMINISTRADOR)
export class OrdenesTrabajoController {
  constructor(
    private readonly ordenesTrabajoService:
      OrdenesTrabajoService,
  ) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA)
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
  @Roles(
    UserRole.ADMINISTRADOR,
    UserRole.RECEPCIONISTA,
    UserRole.MECANICO,
    UserRole.CAJERO,
  )
  obtenerTodas(@Req() request: AuthenticatedRequest) {
    return this.ordenesTrabajoService
      .obtenerTodas(request.user);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMINISTRADOR,
    UserRole.RECEPCIONISTA,
    UserRole.MECANICO,
    UserRole.CAJERO,
  )
  obtenerPorId(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ordenesTrabajoService
      .obtenerPorId(id, request.user);
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