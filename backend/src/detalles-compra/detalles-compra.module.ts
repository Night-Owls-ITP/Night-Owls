import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from '../compras/compra.entity';
import { Repuesto } from '../repuestos/repuesto.entity';
import { DetalleCompra } from './detalle-compra.entity';
import { DetallesCompraController } from './detalles-compra.controller';
import { DetallesCompraService } from './detalles-compra.service';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleCompra, Compra, Repuesto])],
  controllers: [DetallesCompraController],
  providers: [DetallesCompraService],
})
export class DetallesCompraModule {}
