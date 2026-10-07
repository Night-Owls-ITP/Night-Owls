import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from '../facturas/factura.entity';
import { OrdenTrabajo } from '../ordenes-trabajo/orden-trabajo.entity';
import { Repuesto } from '../repuestos/repuesto.entity';
import { DetalleRepuesto } from './detalle-repuesto.entity';
import { DetallesRepuestoController } from './detalles-repuesto.controller';
import { DetallesRepuestoService } from './detalles-repuesto.service';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleRepuesto, OrdenTrabajo, Repuesto, Factura])],
  controllers: [DetallesRepuestoController],
  providers: [DetallesRepuestoService],
})
export class DetallesRepuestoModule {}
