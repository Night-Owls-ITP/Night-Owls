import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleRepuesto } from '../detalles-repuesto/detalle-repuesto.entity';
import { DetalleServicio } from '../detalles-servicio/detalle-servicio.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Factura } from './factura.entity';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, OrdenTrabajo, DetalleServicio, DetalleRepuesto])],
  controllers: [FacturasController],
  providers: [FacturasService],
})
export class FacturasModule {}
