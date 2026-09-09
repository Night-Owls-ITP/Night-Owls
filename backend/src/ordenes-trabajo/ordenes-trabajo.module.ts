import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdenTrabajo } from './orden-trabajo.entity';

import { OrdenesTrabajoController } from './ordenes-trabajo.controller';

import { OrdenesTrabajoService } from './ordenes-trabajo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenTrabajo,
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