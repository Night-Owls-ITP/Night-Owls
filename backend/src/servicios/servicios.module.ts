import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleServicio } from '../detalles-servicio/detalle-servicio.entity';
import { Servicio } from './servicio.entity';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, DetalleServicio])],
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}
