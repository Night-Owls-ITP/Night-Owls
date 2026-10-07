import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from '../facturas/factura.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Servicio } from '../servicios/servicio.entity';
import { DetalleServicio } from './detalle-servicio.entity';
import { DetallesServicioController } from './detalles-servicio.controller';
import { DetallesServicioService } from './detalles-servicio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleServicio, OrdenTrabajo, Servicio, Factura]),
  ],
  controllers: [DetallesServicioController],
  providers: [DetallesServicioService],
})
export class DetallesServicioModule {}
