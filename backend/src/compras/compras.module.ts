import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompra } from '../detalles-compra/detalle-compra.entity';
import { Proveedor } from '../proveedores/proveedor.entity';
import { Compra } from './compra.entity';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, Proveedor, DetalleCompra])],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}
