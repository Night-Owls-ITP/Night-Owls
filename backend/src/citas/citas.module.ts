import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { Cita } from './cita.entity';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cita, Vehiculo, OrdenTrabajo])],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
