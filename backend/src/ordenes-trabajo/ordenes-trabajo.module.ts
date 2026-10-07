import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdenTrabajo } from './orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Mecanico } from '../mecanicos/mecanico.entity';
import { Usuario } from '../usuarios/usuario.entity';

import { OrdenesTrabajoController } from './ordenes-trabajo.controller';

import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenTrabajo,
      Vehiculo,
      Mecanico,
      Usuario,
    ]),
  ],

  controllers: [
    OrdenesTrabajoController,
  ],

  providers: [
    OrdenesTrabajoService,
  ],
})
export class OrdenesTrabajoModule {}