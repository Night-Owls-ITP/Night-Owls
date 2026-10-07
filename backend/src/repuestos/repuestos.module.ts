import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompra } from '../detalles-compra/detalle-compra.entity';
import { DetalleRepuesto } from '../detalles-repuesto/detalle-repuesto.entity';
import { Repuesto } from './repuesto.entity';
import { RepuestosController } from './repuestos.controller';
import { RepuestosService } from './repuestos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto, DetalleCompra, DetalleRepuesto])],
  controllers: [RepuestosController],
  providers: [RepuestosService],
})
export class RepuestosModule {}
